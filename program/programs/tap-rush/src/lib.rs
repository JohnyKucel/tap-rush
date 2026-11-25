//! Tap Rush — real-time tap race on Solana Ephemeral Rollups (Blitz v10).
//!
//! Flow: initialize_player -> delegate (base layer) -> start_round -> tap*
//! (gasless, ~10ms, on the Ephemeral Rollup) -> finish_round (commit +
//! undelegate back to devnet) -> record_score (base layer leaderboard).
//!
//! Written from scratch following the delegation pattern documented by
//! MagicBlock (docs.magicblock.gg — Anchor guide). No example code copied.
//! Program ID: keypair generated 25 Nov 2026 (program/target/deploy/tap_rush-keypair.json).
//! Devnet-only program keypair — never a mainnet or Grey wallet key.
//! (declare_id! di bawah sudah keypair asli, bukan placeholder.)

use anchor_lang::prelude::*;
use ephemeral_rollups_sdk::anchor::{commit, delegate, ephemeral};
use ephemeral_rollups_sdk::cpi::DelegateConfig;
use ephemeral_rollups_sdk::ephem::MagicIntentBundleBuilder;

// Program ID: keypair generated 25 Nov 2026 (program/target/deploy/tap_rush-keypair.json).
// Devnet-only program keypair — never a mainnet or Grey wallet key.
declare_id!("PUZyzzFpJue8Yj95KoEVh6863zUhqJMFVdHjZmgBi5N");

pub const PLAYER_SEED: &[u8] = b"tap-rush";
pub const LEADERBOARD_SEED: &[u8] = b"leaderboard";
/// One round lasts 10 seconds.
pub const ROUND_SECONDS: i64 = 10;

#[ephemeral]
#[program]
pub mod tap_rush {
    use super::*;

    /// Create the player round account if it does not exist yet.
    pub fn initialize_player(ctx: Context<InitializePlayer>) -> Result<()> {
        let round = &mut ctx.accounts.round;
        round.player = ctx.accounts.user.key();
        round.taps = 0;
        round.best = 0;
        round.round_start = 0;
        round.active = false;
        msg!("Tap Rush player ready: {}", round.player);
        Ok(())
    }

    /// Start a fresh 10-second round. Resets the tap counter.
    pub fn start_round(ctx: Context<PlayRound>) -> Result<()> {
        let round = &mut ctx.accounts.round;
        let clock = Clock::get()?;
        round.taps = 0;
        round.round_start = clock.unix_timestamp;
        round.active = true;
        msg!("Round started at {}", round.round_start);
        Ok(())
    }

    /// One tap. Only counts while the round is active and inside the window.
    pub fn tap(ctx: Context<PlayRound>) -> Result<()> {
        let round = &mut ctx.accounts.round;
        require!(round.active, TapRushError::RoundNotActive);
        let clock = Clock::get()?;
        require!(
            clock.unix_timestamp < round.round_start + ROUND_SECONDS,
            TapRushError::RoundOver
        );
        round.taps = round.taps.checked_add(1).unwrap();
        msg!("Tap {} at {}", round.taps, clock.unix_timestamp);
        Ok(())
    }

    /// End the round: keep the best score, commit the state back to devnet
    /// and undelegate the account from the Ephemeral Rollup.
    pub fn finish_round(ctx: Context<FinishRound>) -> Result<()> {
        let round = &mut ctx.accounts.round;
        require!(round.active, TapRushError::RoundNotActive);
        if round.taps > round.best {
            round.best = round.taps;
        }
        round.active = false;
        msg!("Round over: {} taps, best {}", round.taps, round.best);
        round.exit(&crate::ID)?;
        MagicIntentBundleBuilder::new(
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.magic_context.to_account_info(),
            ctx.accounts.magic_program.to_account_info(),
        )
        .commit_and_undelegate(&[ctx.accounts.round.to_account_info()])
        .build_and_invoke()?;
        Ok(())
    }

    /// Base-layer only: copy the player's best score into the global
    /// leaderboard when it beats the current top score.
    pub fn record_score(ctx: Context<RecordScore>) -> Result<()> {
        let round = &ctx.accounts.round;
        let board = &mut ctx.accounts.leaderboard;
        require!(!round.active, TapRushError::RoundNotActive);
        if round.best > board.top_score {
            board.top_score = round.best;
            board.top_player = round.player;
            msg!("New leader: {} with {}", board.top_player, board.top_score);
        }
        Ok(())
    }

    /// Delegate the player round account to the Ephemeral Rollup.
    pub fn delegate(ctx: Context<DelegateInput>) -> Result<()> {
        ctx.accounts.delegate_pda(
            &ctx.accounts.payer,
            &[PLAYER_SEED, ctx.accounts.payer.key().as_ref()],
            DelegateConfig {
                validator: ctx.remaining_accounts.first().map(|acc| acc.key()),
                ..Default::default()
            },
        )?;
        Ok(())
    }

    /// Manually commit the delegated account state back to devnet.
    pub fn commit(ctx: Context<FinishRound>) -> Result<()> {
        MagicIntentBundleBuilder::new(
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.magic_context.to_account_info(),
            ctx.accounts.magic_program.to_account_info(),
        )
        .commit(&[ctx.accounts.round.to_account_info()])
        .build_and_invoke()?;
        Ok(())
    }

    /// Undelegate the player round account from the Ephemeral Rollup.
    pub fn undelegate(ctx: Context<FinishRound>) -> Result<()> {
        MagicIntentBundleBuilder::new(
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.magic_context.to_account_info(),
            ctx.accounts.magic_program.to_account_info(),
        )
        .commit_and_undelegate(&[ctx.accounts.round.to_account_info()])
        .build_and_invoke()?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializePlayer<'info> {
    #[account(init_if_needed, payer = user, space = 8 + 32 + 8 + 8 + 8 + 1,
              seeds = [PLAYER_SEED, user.key().as_ref()], bump)]
    pub round: Account<'info, PlayerRound>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PlayRound<'info> {
    // PDA seeds must come from another account (the signer), never from the
    // account being derived — its data is not loaded yet at derivation time.
    #[account(mut, seeds = [PLAYER_SEED, user.key().as_ref()], bump)]
    pub round: Account<'info, PlayerRound>,
    pub user: Signer<'info>,
}

#[commit]
#[derive(Accounts)]
pub struct FinishRound<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut, seeds = [PLAYER_SEED, payer.key().as_ref()], bump)]
    pub round: Account<'info, PlayerRound>,
}

#[derive(Accounts)]
pub struct RecordScore<'info> {
    #[account(seeds = [PLAYER_SEED, user.key().as_ref()], bump)]
    pub round: Account<'info, PlayerRound>,
    #[account(init_if_needed, payer = user, space = 8 + 32 + 8,
              seeds = [LEADERBOARD_SEED], bump)]
    pub leaderboard: Account<'info, Leaderboard>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

/// Add delegate function to the context
#[delegate]
#[derive(Accounts)]
pub struct DelegateInput<'info> {
    pub payer: Signer<'info>,
    /// CHECK The PDA to delegate
    #[account(mut, del)]
    pub pda: UncheckedAccount<'info>,
}

#[account]
pub struct PlayerRound {
    pub player: Pubkey,
    pub taps: u64,
    pub best: u64,
    pub round_start: i64,
    pub active: bool,
}

#[account]
pub struct Leaderboard {
    pub top_player: Pubkey,
    pub top_score: u64,
}

#[error_code]
pub enum TapRushError {
    #[msg("No round is active right now.")]
    RoundNotActive,
    #[msg("The 10-second round is over.")]
    RoundOver,
}
