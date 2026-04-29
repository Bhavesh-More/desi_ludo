import { useState } from "react";
import { motion } from "framer-motion";
import { useGameStore } from "../store/gameStore";

export default function StartMenu() {
  const startGame = useGameStore((state) => state.startGame);
  const [players, setPlayers] = useState<number>(2);
  const [isStarting, setIsStarting] = useState<boolean>(false);

  const handleStart = async () => {
    setIsStarting(true);
    try {
      await startGame(players);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <motion.section
      className="menu-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Left decorative panel */}
      <div className="menu-deco" aria-hidden="true">
        <div className="deco-board-wrap">
          <img
            src="/assets/board/board.png"
            alt=""
            className="deco-board-img"
          />
        </div>
        <div className="deco-shell-cluster">
          <img
            src="/assets/shells/shell_front.png"
            alt=""
            className="deco-shell deco-shell-1"
          />
          <img
            src="/assets/shells/shell_back.png"
            alt=""
            className="deco-shell deco-shell-2"
          />
          <img
            src="/assets/shells/shell_front.png"
            alt=""
            className="deco-shell deco-shell-3"
          />
        </div>
        <div className="deco-eyebrow">
          <span className="eyebrow-dot" />
          Classic Indian Board Game
        </div>
        <h1 className="deco-headline">
          Desi
          <br />
          Ludo
        </h1>
        <p className="deco-subtext">
          Roll the kawadi. Race your shells.
          <br />
          The oldest game on the oldest subcontinent.
        </p>
        <div className="deco-tags">
          <span className="deco-tag">2–4 Players</span>
          <span className="deco-tag">Strategy</span>
          <span className="deco-tag">Luck</span>
        </div>
      </div>

      {/* Right card panel */}
      <motion.div
        className="menu-card-right"
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.12, ease: "easeOut" }}
      >
        <span className="card-right-eyebrow">
          <span className="eyebrow-dot" />
          Play New Game
        </span>
        <h2 className="card-right-title flex items-center w-full gap-2">
          <img
            src="/cropped_circle_image.png"
            width={40}
            className="block"
            alt=""
          />
          <span>Ready to Play?</span>
        </h2>
        <p className="card-right-sub">
          Choose your player count and enter the board.
        </p>

        <div className="card-divider" />

        <div className="card-control">
          <span className="card-label">Players</span>
          <div className="player-select-row">
            {[2, 3, 4].map((count) => (
              <button
                key={count}
                type="button"
                className={`player-pill ${players === count ? "is-active" : ""}`}
                onClick={() => setPlayers(count)}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        <motion.button
          onClick={handleStart}
          className="primary-btn"
          disabled={isStarting}
          whileHover={{ scale: isStarting ? 1 : 1.025 }}
          whileTap={{ scale: isStarting ? 1 : 0.975 }}
        >
          {isStarting ? (
            <>
              <span className="btn-spinner" />
              Preparing…
            </>
          ) : (
            "Start Game"
          )}
        </motion.button>
          
        <p className="m-2 font-bold " > Kaudi ki awaaz, aur kismat ka raaz - yahi hai Challas Aath ka andaaz.</p>
      </motion.div>

      {/* Floating decorative shapes */}
      <div className="deco-circle deco-circle-1" aria-hidden="true" />
      <div className="deco-circle deco-circle-2" aria-hidden="true" />
      <div className="deco-ring deco-ring-1" aria-hidden="true" />
    </motion.section>
  );
}
