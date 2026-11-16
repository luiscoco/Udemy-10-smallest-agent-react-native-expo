import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./api";
import { isAgentResult, type AgentResult, type TimelineMessage } from "./types";
function useCourseState() {
  const [prompt, setPrompt] = useState(
    "Say hello to the world in one sentence.",
  );
  const [mode, setMode] = useState<"stream" | "simple">("stream");
  const [status, setStatus] = useState("idle"),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [result, setResult] = useState<AgentResult | null>(null),
    [messages, setMessages] = useState<TimelineMessage[]>([]);
  const [health, setHealth] = useState("Checking server…"),
    [elapsed, setElapsed] = useState(0),
    [dark, setDark] = useState(false);
  const locked = useRef(false),
    controller = useRef<AbortController | null>(null);
  useEffect(() => {
    void AsyncStorage.getItem("smallest-agent-theme")
      .then((value) => setDark(value === "dark"))
      .catch(() => {});
    const abort = new AbortController();
    void api
      .health(abort.signal)
      .then((h) =>
        setHealth(
          h.api_key_configured
            ? "API ready"
            : "API ready · configure backend key",
        ),
      )
      .catch(() => {
        if (!abort.signal.aborted) setHealth("API offline · start the backend");
      });
    return () => {
      abort.abort();
      controller.current?.abort();
    };
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 6000);
    return () => clearTimeout(timer);
  }, [notice]);
  async function run() {
    const trimmed = prompt.trim();
    if (locked.current || !trimmed || trimmed.length > 4000) return;
    locked.current = true;
    setStatus("loading");
    setError("");
    setResult(null);
    setMessages([]);
    setElapsed(0);
    const active = new AbortController();
    controller.current = active;
    const started = Date.now();
    const timer = setInterval(
      () => setElapsed((Date.now() - started) / 1000),
      100,
    );
    const deadline = setTimeout(() => active.abort(), 180000);
    let final: AgentResult | null = null;
    try {
      if (mode === "simple") final = await api.query(trimmed, active.signal);
      else
        await api.stream(
          trimmed,
          (message) => {
            setMessages((previous) =>
              previous.length < 500
                ? [
                    ...previous,
                    { ...message, elapsed: (Date.now() - started) / 1000 },
                  ]
                : previous,
            );
            if (
              message.type === "ResultMessage" &&
              isAgentResult(message.data)
            ) {
              final = message.data;
              setResult(message.data);
            }
          },
          active.signal,
        );
      if (!final) throw new Error("The agent finished without a final answer.");
      setResult(final);
      setStatus(final.is_error ? "error" : "success");
      if (final.is_error) {
        setError(final.result);
        setNotice("The agent reported an error.");
      } else setNotice("Answer received.");
    } catch (err) {
      const message = active.signal.aborted
        ? "The request was canceled or timed out."
        : err instanceof Error
          ? err.message
          : "The request could not finish.";
      setError(message);
      setNotice(message);
      setStatus("error");
    } finally {
      clearInterval(timer);
      clearTimeout(deadline);
      locked.current = false;
      controller.current = null;
      setElapsed((Date.now() - started) / 1000);
    }
  }
  function toggleTheme() {
    const next = !dark;
    setDark(next);
    void AsyncStorage.setItem(
      "smallest-agent-theme",
      next ? "dark" : "light",
    ).catch(() => {});
  }
  return {
    prompt,
    setPrompt,
    mode,
    setMode,
    status,
    error,
    notice,
    setNotice,
    result,
    messages,
    health,
    elapsed,
    dark,
    toggleTheme,
    run,
    cancel: () => controller.current?.abort(),
  };
}
type State = ReturnType<typeof useCourseState>;
const CourseContext = createContext<State | null>(null);
export function CourseProvider({ children }: { children: React.ReactNode }) {
  const state = useCourseState();
  return (
    <CourseContext.Provider value={state}>{children}</CourseContext.Provider>
  );
}
export function useCourse() {
  const state = useContext(CourseContext);
  if (!state) throw new Error("Missing course provider");
  return state;
}
