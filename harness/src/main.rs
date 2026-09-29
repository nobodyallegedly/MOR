//! `mor-gauntlet`: run the identity gauntlet (freeze test suite, scenario 5,
//! steps 6 to 7d).
//!
//! ```text
//! mor-gauntlet local
//! mor-gauntlet live --home https://home1.example --home https://home2.example \
//!     --home http://….onion --tor-proxy socks5h://127.0.0.1:9050 [--machine-dir ~/mor-home]
//! ```
//!
//! A live run uses the three deployed homes for identities A and B; the
//! third address is the home on the machine running this program. Every
//! other check runs on throwaway homes this program starts here.

use clap::{Parser, Subcommand};
use mor_harness::gauntlet::Gauntlet;
use std::path::PathBuf;

#[derive(Parser)]
#[command(
    name = "mor-gauntlet",
    about = "The MOR identity gauntlet: freeze test suite, scenario 5, steps 6 to 7d. Test identities only."
)]
struct Cli {
    #[command(subcommand)]
    cmd: Cmd,
    /// Also write the report to this file.
    #[arg(long, global = true)]
    out: Option<PathBuf>,
}

#[derive(Subcommand)]
enum Cmd {
    /// Every home on this machine.
    Local,
    /// The three deployed homes, the third on this machine.
    Live {
        /// A deployed home's base address, three times: the two public
        /// homes, then the one on this machine.
        #[arg(long = "home", num_args = 1, required = true)]
        homes: Vec<String>,
        /// Tor's SOCKS proxy, to reach the onion address.
        #[arg(long)]
        tor_proxy: Option<String>,
        /// The data directory of the home on this machine, so the harness
        /// can list its test identities there itself.
        #[arg(long)]
        machine_dir: Option<PathBuf>,
    },
}

#[tokio::main]
async fn main() {
    let cli = Cli::parse();
    let g = match cli.cmd {
        Cmd::Local => Gauntlet::local(true).await,
        Cmd::Live {
            homes,
            tor_proxy,
            machine_dir,
        } => {
            let Ok(bases) = <[String; 3]>::try_from(homes) else {
                eprintln!("mor-gauntlet: give --home exactly three times");
                std::process::exit(2)
            };
            match Gauntlet::live(&bases, tor_proxy.as_deref(), machine_dir, true).await {
                Ok(g) => g,
                Err(e) => {
                    eprintln!("mor-gauntlet: {e}");
                    std::process::exit(2)
                }
            }
        }
    };
    let report = g.run().await;
    let text = report.text();
    println!("\n{text}");
    if let Some(p) = cli.out {
        if let Err(e) = std::fs::write(&p, &text) {
            eprintln!("mor-gauntlet: {}: {e}", p.display());
        }
    }
    std::process::exit(if report.passed() { 0 } else { 1 })
}
