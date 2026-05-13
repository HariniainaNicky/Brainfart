mod api;
mod commands;
mod models;

use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(name = "brainfart-cli", version, about = "CLI client for BrainFart trivia")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Sign in to your account
    Login,
    /// Create a new account
    Signup,
    /// Sign out and clear saved session
    Logout,
    /// Show current login status
    Status,
    /// List open rooms
    Rooms,
    /// Room management (create, join, leave, close, view)
    Room {
        #[command(subcommand)]
        action: RoomAction,
    },
    /// Play a trivia game
    Play,
    /// Show the leaderboard
    Leaderboard,
    /// View a user's profile
    Profile {
        /// User ID or username
        id: String,
    },
}

#[derive(Subcommand)]
enum RoomAction {
    /// Create a new room
    Create,
    /// Join an existing room
    Join { id: String },
    /// Leave a room
    Leave { id: String },
    /// Close a room (owner only)
    Close { id: String },
    /// View room details
    View { id: String },
}

#[tokio::main]
async fn main() {
    let cli = Cli::parse();

    match &cli.command {
        Commands::Login => println!("brainfart-cli login"),
        Commands::Signup => println!("brainfart-cli signup"),
        Commands::Logout => println!("brainfart-cli logout"),
        Commands::Status => println!("brainfart-cli status"),
        Commands::Rooms => println!("brainfart-cli rooms"),
        Commands::Room { action } => match action {
            RoomAction::Create => println!("brainfart-cli room create"),
            RoomAction::Join { id } => println!("brainfart-cli room join {id}"),
            RoomAction::Leave { id } => println!("brainfart-cli room leave {id}"),
            RoomAction::Close { id } => println!("brainfart-cli room close {id}"),
            RoomAction::View { id } => println!("brainfart-cli room view {id}"),
        },
        Commands::Play => println!("brainfart-cli play"),
        Commands::Leaderboard => println!("brainfart-cli leaderboard"),
        Commands::Profile { id } => println!("brainfart-cli profile {id}"),
    }
}
