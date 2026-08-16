"use client";

import { useMemo, useState } from "react";
import type { KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/components/ToastProvider";
import styles from "./game.module.scss";

type GameType = "fact" | "scramble" | "image";

type GameQuestion = {
  questionId: string;
  question: string;
  options: string[];
};

interface GameClientProps {
  title: string;
  description: string;
  gameType: GameType;
}

interface GameSessionResponse {
  sessionId: string;
  questions: GameQuestion[];
}

interface SubmitResult {
  score: number;
  rewards: {
    xp: number;
    coins: number;
    dailyBonus: number;
  };
  streak: number;
}

const formatQuestion = (question: string, gameType: GameType) => {
  if (gameType === "image") return question;
  return question;
};

const friendlyGameErrorMessage = (
  status?: number,
  payload?: Record<string, any> | null,
) => {
  const code = payload?.code || payload?.extraData?.code;
  const remainingSeconds = payload?.cooldownSecondsRemaining;

  if (status === 401) return "Please log in again to start a round.";
  if (status === 403) return "You cannot start that game right now.";
  if (status === 404) return "That game mode is unavailable right now.";
  if (status === 429 || code === "SESSION_COOLDOWN") {
    if (Number.isFinite(Number(remainingSeconds))) {
      const seconds = Number(remainingSeconds);
      return `Please wait ${seconds} second${seconds === 1 ? "" : "s"} before starting another round.`;
    }

    return "Please wait a moment before starting another round.";
  }

  if (typeof payload?.message === "string" && payload.message.length > 0) {
    return payload.message;
  }

  return "We could not start that round right now. Please try again.";
};

export function GameClient({ title, description, gameType }: GameClientProps) {
  const router = useRouter();
  const { notify } = useToast();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [status, setStatus] = useState<
    "idle" | "loading" | "ready" | "complete" | "error"
  >("idle");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const currentQuestion = questions[currentIndex];
  const progressLabel = questions.length
    ? `Question ${currentIndex + 1} of ${questions.length}`
    : "";
  const modeLabel = useMemo(() => {
    if (gameType === "fact") return "Trivia";
    if (gameType === "scramble") return "Scramble";
    return "Who's That Pokémon";
  }, [gameType]);

  const startSession = async () => {
    setStatus("loading");
    setMessage(null);

    try {
      const response = await fetch("/api/game/start", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: gameType }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        const message = friendlyGameErrorMessage(response.status, payload);
        notify({ message, variant: "error" });
        throw new Error(message);
      }

      const data = (await response.json()) as GameSessionResponse;
      setSessionId(data.sessionId);
      setQuestions(data.questions);
      setCurrentIndex(0);
      setAnswers({});
      setSelectedOption("");
      setStatus("ready");
    } catch (error: any) {
      setStatus("error");
      setMessage(error?.message || "An error occurred while starting the game.");
    }
  };

  const goBack = () => {
    router.push("/games");
  };

  const goPrevious = () => {
    if (currentIndex === 0) return;

    const previousQuestion = questions[currentIndex - 1];
    setCurrentIndex((index) => Math.max(0, index - 1));
    setSelectedOption(answers[previousQuestion.questionId] || "");
  };

  const moveSelection = (direction: 1 | -1) => {
    if (!currentQuestion?.options.length) return;

    const currentOptionIndex = currentQuestion.options.indexOf(selectedOption);
    const safeIndex =
      currentOptionIndex >= 0 ? currentOptionIndex : direction === 1 ? -1 : 0;
    const nextIndex =
      (safeIndex + direction + currentQuestion.options.length) %
      currentQuestion.options.length;

    setSelectedOption(currentQuestion.options[nextIndex]);
  };

  const handleQuestionKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
  ) => {
    if (status !== "ready" || !currentQuestion) return;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      moveSelection(1);
    }

    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      moveSelection(-1);
    }

    if (event.key === "Enter" && selectedOption) {
      event.preventDefault();
      void submitAnswer();
    }
  };

  const submitAnswer = async () => {
    if (!currentQuestion) return;
    if (!selectedOption) {
      setMessage("Pick an answer before moving on.");
      notify({
        message: "Choose an answer before moving to the next question.",
        variant: "info",
      });
      return;
    }

    setMessage(null);
    const nextAnswers = {
      ...answers,
      [currentQuestion.questionId]: selectedOption,
    };
    setAnswers(nextAnswers);
    setSelectedOption("");

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      return;
    }

    if (!sessionId) {
      setStatus("error");
      setMessage("Session is missing. Please restart the game.");
      return;
    }

    setStatus("loading");

    try {
      const payload = Object.entries(nextAnswers).map(
        ([questionId, selected]) => ({ questionId, selected }),
      );
      const response = await fetch("/api/game/submit", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, answers: payload }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message = friendlyGameErrorMessage(response.status, body);
        notify({ message, variant: "error" });
        throw new Error(message);
      }

      const data = (await response.json()) as SubmitResult;
      setResult(data);
      setStatus("complete");
      notify({
        title: "Round complete",
        message: `You earned ${data.rewards.coins} Pokecoins and ${data.rewards.xp} XP.`,
        variant: "success",
      });
    } catch (error: any) {
      setStatus("error");
      setMessage(error?.message || "Submission failed.");
    }
  };

  const restart = () => {
    setSessionId(null);
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedOption("");
    setAnswers({});
    setResult(null);
    setMessage(null);
    setStatus("idle");
  };

  return (
    <main className={styles.gamePage}>
      <section className={styles.header}>
        <div>
          <p className={styles.modeLabel}>{modeLabel}</p>
          <h1>{title}</h1>
          <p className={styles.description}>{description}</p>
        </div>
        <div className={styles.metaPanel}>
          <div>
            <span className={styles.metaLabel}>Game style</span>
            <p>
              {gameType === "fact"
                ? "Trivia Questions"
                : gameType === "scramble"
                  ? "Word Scramble"
                  : "Silhouette Guessing"}
            </p>
          </div>
          {/* <div>
            <span className={styles.metaLabel}>Gameplay</span>
            <p>One question at a time</p>
          </div>
          <div>
            <span className={styles.metaLabel}>Secure session</span>
            <p>Answers are validated server-side</p>
          </div> */}
        </div>
      </section>

      {status === "idle" && (
        <section className={styles.startPanel}>
          <div>
            <p className={styles.startPrompt}>
              Ready to play?
            </p>
          </div>
          <div className={styles.controlRow}>
            <button
              className={styles.secondaryButton}
              type="button"
              onClick={goBack}
            >
              Back
            </button>
            <button
              className={styles.primaryButton}
              type="button"
              onClick={startSession}
            >
              Start {title}
            </button>
          </div>
        </section>
      )}

      {status === "loading" && (
        <section className={styles.loadingPanel} role="status" aria-live="polite">
          <p>Loading your round…</p>
        </section>
      )}

      {status === "ready" && currentQuestion && (
        <section className={styles.questionPanel} aria-label="Quiz round">
          <div className={styles.progressBar} aria-hidden="true">
            <div
              className={styles.progressFill}
              style={{
                width: `${((currentIndex + 1) / questions.length) * 100}%`,
              }}
            />
          </div>
          <div className={styles.questionMeta}>
            <span>{progressLabel}</span>
            <span>{questions.length} total questions</span>
          </div>
          <div
            className={styles.questionCard}
            tabIndex={0}
            onKeyDown={handleQuestionKeyDown}
            aria-label="Question and answers"
          >
            <div
              className={styles.questionText}
              aria-live="polite"
              aria-atomic="true"
            >
              {gameType === "image" ? (
                <img
                  src={formatQuestion(currentQuestion.question, gameType)}
                  alt={`Silhouette question ${currentIndex + 1}`}
                  className={styles.image}
                />
              ) : (
                <div
                  dangerouslySetInnerHTML={{
                    __html: formatQuestion(currentQuestion.question, gameType),
                  }}
                />
              )}
            </div>

            <div className={styles.answerGrid}>
              {currentQuestion.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`${styles.answerButton} ${selectedOption === option ? styles.selected : ""}`}
                  onClick={() => setSelectedOption(option)}
                  aria-pressed={selectedOption === option}
                  aria-label={`Answer option: ${option}`}
                >
                  {option}
                </button>
              ))}
            </div>

            {message && (
              <p className={styles.feedback} role="status" aria-live="polite">
                {message}
              </p>
            )}

            <div className={styles.controlRow}>
              <button
                className={styles.primaryButton}
                type="button"
                onClick={submitAnswer}
                disabled={!selectedOption}
              >
                {currentIndex + 1 < questions.length
                  ? "Next question"
                  : "Submit answers"}
              </button>
              <button
                className={styles.secondaryButton}
                type="button"
                onClick={goPrevious}
                disabled={currentIndex === 0}
              >
                Previous
              </button>
            </div>
          </div>
        </section>
      )}

      {status === "complete" && result && (
        <section className={styles.resultPanel} role="status" aria-live="polite">
          <h2>Round complete!</h2>
          <p>You finished the round with {result.score} correct answers.</p>
          <div className={styles.resultGrid}>
            <div>
              <span>XP earned</span>
              <strong>{result.rewards.xp}</strong>
            </div>
            <div>
              <span>Pokécoins</span>
              <strong>{result.rewards.coins}</strong>
            </div>
            <div>
              <span>Daily bonus</span>
              <strong>{result.rewards.dailyBonus}</strong>
            </div>
            <div>
              <span>Login streak</span>
              <strong>{result.streak} days</strong>
            </div>
          </div>
          <button
            className={styles.primaryButton}
            type="button"
            onClick={restart}
          >
            Play another round
          </button>
        </section>
      )}

      {status === "error" && message && (
        <section className={styles.errorPanel} role="alert">
          <h2>Something went wrong</h2>
          <p>{message}</p>
          <button
            className={styles.primaryButton}
            type="button"
            onClick={restart}
          >
            Try again
          </button>
        </section>
      )}
    </main>
  );
}
