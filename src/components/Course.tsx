import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  Image,
  Platform,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, usePathname, type Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SvgXml } from "react-native-svg";
import * as Clipboard from "expo-clipboard";
import { useCourse } from "../lib/state";
import { saveText } from "../lib/files";
import { CodeBlock } from "./CodeBlock";
import { Answer } from "./Answer";
import lesson from "../lesson/workflow.json";
import { workflowSvg, workflowPuml } from "../lesson/diagram";
const tabs = [
  ["/", "Agent lab"],
  ["/learn", "What you will learn"],
  ["/run", "How to run"],
  ["/architecture", "Architecture & workflow"],
  ["/walkthrough", "Code walkthrough"],
];
const topics = [
  [
    "01 · One native interface",
    "React Native renders View, Text, Pressable and TextInput on Android, iOS and web. Expo Router gives each lesson a URL while a shared provider preserves your prompt and answer.",
  ],
  [
    "02 · The smallest agent",
    "The server calls query({ prompt, options }) from the TypeScript Claude Agent SDK and iterates its messages. The CLI runtime owns the model exchange.",
  ],
  [
    "03 · Server-only credentials",
    "The Expo bundle contains a public API URL. ANTHROPIC_API_KEY stays in backend/.env, and the health response reports only whether a key is configured.",
  ],
  [
    "04 · Stream or simple",
    "Simple waits for JSON. Stream receives real SDK lifecycle, assistant and result projections over Server-Sent Events through expo/fetch. These are SDK messages rather than token-by-token text.",
  ],
  [
    "05 · A constrained lesson",
    "Built-in tools, skills, plugins, MCP and persisted sessions are disabled. Inputs are bounded and validated; provider errors are converted to safe messages. This local teaching server needs authentication and quotas before public exposure.",
  ],
  [
    "06 · Read the result",
    "The final SDK result supplies answer, duration, turns, estimated cost and is_error. A done event confirms transport completion; it cannot turn an error result into success.",
  ],
];
const setup = `# Windows PowerShell — start from Lesson 0
cd .\\10-smallest-agent-react-native-expo
npm install
npm --prefix backend install
if (!(Test-Path backend\\.env)) { Copy-Item backend\\.env.example backend\\.env }
if (!(Test-Path .env)) { Copy-Item .env.example .env }
notepad backend\\.env
# Replace the placeholder with your own Anthropic API key.
# Keep the key out of the root Expo .env.
npm run dev`;
const checks = `# From 10-smallest-agent-react-native-expo
npm run typecheck
npm run lint
npm test
npm run build
# In a second terminal while npm run dev is running:
Invoke-RestMethod http://127.0.0.1:8500/api/health`;
function TimelineRow({
  item,
  color,
}: {
  item: { elapsed: number; type: string; summary: string; data: unknown };
  color: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View
      style={{
        borderTopWidth: 1,
        borderColor: "#9aacc655",
        paddingVertical: 14,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
          aria-expanded={open}
        onPress={() => setOpen(!open)}
        style={{ minHeight: 48 }}
      >
        <Text
          style={{ fontSize: 17, lineHeight: 26, color, fontWeight: "700" }}
        >
          {item.elapsed.toFixed(1)}s · {item.type} {open ? "−" : "+"}
        </Text>
        <Text style={{ fontSize: 18, lineHeight: 28, color }}>
          {item.summary}
        </Text>
      </Pressable>
      {open && (
        <CodeBlock code={JSON.stringify(item.data, null, 2)} language="json" />
      )}
    </View>
  );
}
function ActionButton({
  label,
  onPress,
  active,
  disabled,
  dark,
  fg,
  tab = false,
}: {
  label: string;
  onPress: () => void;
  active: boolean;
  disabled: boolean;
  dark: boolean;
  fg: string;
  tab?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityRole={tab ? "tab" : "button"}
      accessibilityLabel={label}
      accessibilityState={tab ? { selected: active, disabled } : { disabled }}
      aria-selected={tab ? active : undefined}
      aria-disabled={disabled}
      disabled={disabled}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: active ? "#1266d4" : dark ? "#253a55" : "#ffffff",
        borderWidth: focused ? 3 : 1,
        borderColor: focused ? "#dd9500" : "#aac2e3",
        borderRadius: 14,
        paddingHorizontal: 18,
        paddingVertical: 13,
        minHeight: 48,
        opacity: disabled ? 0.5 : pressed ? 0.75 : 1,
      })}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: "600",
          color: active ? "white" : fg,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export default function Course() {
  const c = useCourse(),
    path = usePathname(),
    { width } = useWindowDimensions();
  const fg = c.dark ? "#edf3ff" : "#172e50",
    muted = c.dark ? "#bdcce2" : "#526886",
    bg = c.dark ? "#0b1729" : "#f5f8fe";
  const blue = c.dark ? "#172f50" : "#eaf3ff",
    mint = c.dark ? "#14382f" : "#e9f7ef",
    lilac = c.dark ? "#302640" : "#f3edff",
    peach = c.dark ? "#3c2d27" : "#fff1e7";
  const busy = c.status === "loading";
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        void c.run();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [c]);
  const text = (value: string, secondary = false) => (
    <Text
      style={{
        color: secondary ? muted : fg,
        fontSize: secondary ? 17 : 21,
        lineHeight: secondary ? 28 : 34,
      }}
    >
      {value}
    </Text>
  );
  const heading = (value: string) => (
    <Text
      accessibilityRole="header"
      style={{
        color: fg,
        fontSize: 29,
        fontWeight: "700",
        lineHeight: 39,
        marginBottom: 14,
      }}
    >
      {value}
    </Text>
  );
  const button = (
    label: string,
    onPress: () => void,
    active = false,
    disabled = false,
    tab = false,
  ) => (
    <ActionButton
      label={label}
      onPress={onPress}
      active={active}
      disabled={disabled}
      dark={c.dark}
      fg={fg}
      tab={tab}
    />
  );
  const card = (children: React.ReactNode, color = blue) => (
    <View
      style={{
        padding: width < 600 ? 20 : 30,
        borderRadius: 25,
        backgroundColor: color,
        borderWidth: 1,
        borderColor: c.dark ? "#3c506c" : "#d5e2f3",
        gap: 14,
        marginBottom: 24,
      }}
    >
      {children}
    </View>
  );
  async function action(work: () => Promise<unknown>) {
    try {
      await work();
      c.setNotice("Ready.");
    } catch (e) {
      c.setNotice(
        e instanceof Error ? e.message : "This action is unavailable.",
      );
    }
  }
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <StatusBar style={c.dark ? "light" : "dark"} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          padding: width < 600 ? 16 : 36,
          alignItems: "center",
        }}
      >
        <View style={{ width: "100%", maxWidth: 1280 }}>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 18,
              marginBottom: 30,
            }}
          >
            <View>
              <Text style={{ fontSize: 20, fontWeight: "800", color: fg }}>
                ◈ COCO / AGENT ACADEMY
              </Text>
              {text("LESSON 0 · EXPO EDITION", true)}
            </View>
            {button(c.dark ? "Light mode" : "Dark mode", c.toggleTheme)}
          </View>
          <View
            style={{
              flexDirection: width > 800 ? "row" : "column",
              alignItems: "center",
              gap: 25,
              marginBottom: 35,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "700",
                  color: "#1772d7",
                  letterSpacing: 2,
                }}
              >
                BUILD IT. RUN IT. UNDERSTAND IT.
              </Text>
              <Text
                accessibilityRole="header"
                style={{
                  fontSize: width > 800 ? 62 : 40,
                  lineHeight: width > 800 ? 70 : 49,
                  fontWeight: "800",
                  color: fg,
                  marginVertical: 18,
                }}
              >
                The smallest agent.{"\n"}Now in your pocket.
              </Text>
              {text(
                "One prompt, one agent, one clear answer. Explore Claude Agent SDK with React Native, Expo and TypeScript.",
              )}
            </View>
            <Image
              source={require("../../assets/astronaut.png")}
              accessibilityLabel="Course astronaut"
              style={{
                width: width > 800 ? 240 : 160,
                height: width > 800 ? 240 : 160,
                resizeMode: "contain",
              }}
            />
          </View>
          <View
            accessibilityRole="tablist"
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 10,
              marginBottom: 30,
            }}
          >
            {tabs.map(([href, label]) => (
              <View key={href}>
                {button(
                  label,
                  () => router.replace(href as Href),
                  path === href,
                    false,
                    true,
                )}
              </View>
            ))}
          </View>
          {path === "/" && (
            <>
              <View
                style={{
                  flexDirection: width > 1000 ? "row" : "column",
                  gap: 24,
                }}
              >
                <View style={{ flex: 1 }}>
                  {card(
                    <>
                      <Text
                        style={{
                          fontSize: 17,
                          fontWeight: "700",
                          color: "#1766bd",
                        }}
                      >
                        01 / INPUT
                      </Text>
                      {heading("Give your agent a mission")}
                      {text(
                        "Start small. Ask a question and follow the messages back to the answer.",
                        true,
                      )}
                      <Text
                        accessibilityRole="text"
                        style={{ color: fg, fontSize: 18, fontWeight: "600" }}
                      >
                        Your prompt
                      </Text>
                      <TextInput
                        accessibilityLabel="Your prompt"
                        multiline
                        value={c.prompt}
                        onChangeText={c.setPrompt}
                        editable={!busy}
                        placeholder="What would you like to ask?"
                        placeholderTextColor={muted}
                        style={{
                          color: fg,
                          backgroundColor: c.dark ? "#10223a" : "white",
                          borderColor: "#a5bfdf",
                          borderWidth: 1,
                          borderRadius: 15,
                          minHeight: 180,
                          padding: 18,
                          fontSize: 21,
                          lineHeight: 33,
                          textAlignVertical: "top",
                        }}
                      />
                      {text(
                        `${c.prompt.trim().length} / 4000 characters · ${c.health}`,
                        true,
                      )}
                      <View
                        style={{
                          flexDirection: "row",
                          flexWrap: "wrap",
                          gap: 10,
                        }}
                      >
                        {[
                          "Say hello to the world in one sentence.",
                          "Explain an AI agent simply.",
                          "Show a tiny TypeScript example.",
                        ].map((prompt) => (
                          <View key={prompt}>
                            {button(
                              prompt,
                              () => c.setPrompt(prompt),
                              false,
                              busy,
                            )}
                          </View>
                        ))}
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          flexWrap: "wrap",
                          gap: 10,
                        }}
                      >
                        {button(
                          "Stream",
                          () => c.setMode("stream"),
                          c.mode === "stream",
                          busy,
                        )}
                        {button(
                          "Simple",
                          () => c.setMode("simple"),
                          c.mode === "simple",
                          busy,
                        )}
                        {button(
                          busy ? "Running…" : "Run agent ↗",
                          () => {
                            void c.run();
                          },
                          true,
                          busy ||
                            !c.prompt.trim() ||
                            c.prompt.trim().length > 4000,
                        )}
                        {busy && button("Cancel", c.cancel)}
                      </View>
                      {text(
                        `${busy ? "Running" : c.status} · ${c.elapsed.toFixed(1)}s · Ctrl + Enter on web`,
                        true,
                      )}
                      {text(
                        "Submitting a prompt may use API credits. Your key stays on the server.",
                        true,
                      )}
                    </>,
                  )}
                  {card(
                    <>
                      <Text
                        style={{
                          fontSize: 17,
                          fontWeight: "700",
                          color: "#187557",
                        }}
                      >
                        02 / OUTPUT
                      </Text>
                      {heading("Your agent’s answer")}
                      {c.error && (
                        <View
                          accessibilityRole="alert"
                          style={{
                            backgroundColor: c.dark ? "#512a32" : "#fff0ee",
                            padding: 18,
                            borderRadius: 12,
                          }}
                        >
                          {text(c.error)}
                        </View>
                      )}
                      {c.result ? (
                        <>
                          <Answer text={c.result.result} color={fg} />
                          {text(
                            `${c.result.num_turns} turn(s) · ${c.result.duration_ms} ms · ${c.result.total_cost_usd === null ? "Cost unavailable" : `Estimated $${c.result.total_cost_usd.toFixed(5)}`} · ${c.result.is_error ? "error" : "success"}`,
                            true,
                          )}
                          <View
                            style={{
                              flexDirection: "row",
                              flexWrap: "wrap",
                              gap: 10,
                            }}
                          >
                            {button("Copy answer", () => {
                              void action(() =>
                                Clipboard.setStringAsync(c.result!.result),
                              );
                            })}
                            {button(
                              Platform.OS === "web"
                                ? "Download Markdown"
                                : "Share Markdown",
                              () => {
                                void action(() =>
                                  saveText(
                                    "agent-answer.md",
                                    c.result!.result,
                                    "text/markdown",
                                  ),
                                );
                              },
                            )}
                          </View>
                        </>
                      ) : (
                        text(
                          busy
                            ? "Your agent is working. Watch the SDK timeline."
                            : "Your answer will appear here after you run the agent.",
                          true,
                        )
                      )}
                    </>,
                    mint,
                  )}
                </View>
                <View style={{ width: width > 1000 ? 390 : "100%" }}>
                  {card(
                    <>
                      <Text
                        style={{
                          fontSize: 17,
                          fontWeight: "700",
                          color: "#8b53c0",
                        }}
                      >
                        LIVE / SDK MESSAGES
                      </Text>
                      {heading("Follow the conversation")}
                      {text(
                        "Real SDK events, projected safely. Expand a row to inspect its JSON.",
                        true,
                      )}
                      {c.messages.length === 0 &&
                        text("Waiting for your first mission…", true)}
                      {c.messages.map((item, i) => (
                        <TimelineRow key={i} item={item} color={fg} />
                      ))}
                      {c.messages.length >= 500 &&
                        text(
                          "Timeline display capped at 500 rows. Final results continue to be processed.",
                          true,
                        )}
                    </>,
                    lilac,
                  )}
                </View>
              </View>
              {card(
                <>
                  {heading(
                    "The same agent, with a native application around it.",
                  )}
                  {text(
                    "Prompt → Expo client → Node API → Claude Agent SDK → Claude. The answer returns through a typed boundary you can inspect.",
                  )}
                  {button("Explore the architecture", () =>
                    router.replace("/architecture"),
                  )}
                </>,
                peach,
              )}
            </>
          )}
          {path === "/learn" && (
            <>
              {heading("What you will learn")}
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 22 }}>
                {topics.map(([title, body], i) => (
                  <View
                    key={title}
                    style={{ width: width > 900 ? "48%" : "100%" }}
                  >
                    {card(
                      <>
                        {heading(title)}
                        {text(body)}
                      </>,
                      [blue, mint, lilac, peach][i % 4],
                    )}
                  </View>
                ))}
              </View>
            </>
          )}
          {path === "/run" && (
            <>
              {heading("Run it on Windows")}
              {card(
                <>
                  {text(
                    "Use Node.js 24 LTS and npm. These commands start from Lesson 0, then stay in this new application folder. Copy each example only once; preserve an existing .env.",
                  )}
                  <CodeBlock
                    code={setup}
                    language="powershell"
                    label="First setup · PowerShell"
                  />
                  {text(
                    "Open http://localhost:5100. npm run dev starts the Node API on port 8500 and Expo web on 5100. Stop both with Ctrl+C. To run separately use npm run dev:api and npm run dev:web in two terminals.",
                    true,
                  )}
                </>,
              )}
              {card(
                <>
                  {heading("Private server configuration")}
                  <CodeBlock
                    language="powershell"
                    label="backend/.env · edit locally"
                    code={
                      "ANTHROPIC_API_KEY=sk-ant-your-own-key\nCLAUDE_MODEL=\nAGENT_MAX_TURNS=1\nAGENT_SYSTEM_PROMPT=You are a concise teaching assistant.\nAPI_HOST=127.0.0.1\nAPI_PORT=8500\nALLOWED_ORIGINS=http://localhost:5100,http://127.0.0.1:5100"
                    }
                  />
                  {text(
                    "Leave CLAUDE_MODEL empty to use the SDK default. A model override must be available to your account. Restart the backend after changes. The root .env may contain only the public API URL; EXPO_PUBLIC_ values are bundled into your app.",
                  )}
                </>,
                mint,
              )}
              {card(
                <>
                  {heading("Android, iOS and physical devices")}
                  {text(
                    "For a phone, set API_HOST=0.0.0.0 in backend/.env and EXPO_PUBLIC_API_URL=http://YOUR-PC-LAN-IP:8500 in the root .env. Connect both devices to the same network and allow the development ports through Windows Firewall. Restart Expo with --clear after public environment changes. A phone’s 127.0.0.1 points to the phone. Android emulator uses http://10.0.2.2:8500.",
                  )}
                  <CodeBlock
                    language="powershell"
                    code={
                      "# Terminal 1, app root\nnpm run dev:api\n# Terminal 2, app root\nnpm run start\n# Use a compatible Expo Go, or a development build:\nnpx eas-cli@latest build --profile development --platform android\n# iOS cloud build requires Apple developer credentials:\nnpx eas-cli@latest build --profile development --platform ios"
                    }
                  />
                  {text(
                    "SDK 58 requires a compatible runtime. If Expo Go does not support it, install a development build. Local iOS compilation requires macOS; EAS cloud builds can be requested from Windows. No cloud build or store upload is run automatically.",
                    true,
                  )}
                </>,
                lilac,
              )}
              {card(
                <>
                  {heading("Verify and export")}
                  <CodeBlock code={checks} language="powershell" />
                  {text(
                    "npm run build exports the web app and compiles the backend. npm run build:native validates Android and iOS JS bundles, without creating signed applications. Deploy the API separately behind HTTPS, authentication and quotas; rebuild Expo with its public production API URL.",
                    true,
                  )}
                </>,
                peach,
              )}
            </>
          )}
          {path === "/architecture" && (
            <>
              {heading("UML architecture & workflow")}
              {card(
                <>
                  {text(
                    "Five lifelines, sixteen numbered interactions. The SDK’s model exchange is internal; the adjacent source cards show the application boundary that triggers it. Scroll the diagram horizontally on a phone.",
                  )}
                  <ScrollView horizontal>
                    <View accessibilityRole="image" accessibilityLabel="UML sequence diagram: sixteen interactions between student, React Native client, Node API, Claude Agent SDK and Claude.">
                      <SvgXml xml={workflowSvg.replace(/ aria-labelledby="[^"]*"/, "")} width={1440} height={1660} />
                    </View>
                  </ScrollView>
                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}
                  >
                    {button("Save UML SVG", () => {
                      void action(() =>
                        saveText("workflow.svg", workflowSvg, "image/svg+xml"),
                      );
                    })}
                    {button("Save PlantUML", () => {
                      void action(() =>
                        saveText("workflow.puml", workflowPuml),
                      );
                    })}
                  </View>
                </>,
              )}
              {lesson.map((step, i) => (
                <View key={step.number}>
                  {card(
                    <>
                      {heading(`${step.number}. ${step.title}`)}
                      {text(step.text)}
                      <CodeBlock
                        code={step.code}
                        label={step.source}
                        language={step.language}
                      />
                      {text(step.explanation, true)}
                    </>,
                    [blue, mint, lilac, peach][i % 4],
                  )}
                </View>
              ))}
            </>
          )}
          {path === "/walkthrough" && (
            <>
              {heading("Code walkthrough")}
              {text(
                "Follow five actual source excerpts from native input to a safe answer. Each snippet is regenerated from this edition’s files.",
              )}
              {[1, 2, 5, 8, 12].map((number) => {
                const step = lesson[number - 1];
                return (
                  <View key={number}>
                    {card(
                      <>
                        {heading(step.title)}
                        {text(step.text)}
                        <CodeBlock
                          code={step.code}
                          label={step.source}
                          language={step.language}
                        />
                        {text(step.explanation, true)}
                      </>,
                      number % 2 ? blue : mint,
                    )}
                  </View>
                );
              })}
            </>
          )}
          <View style={{ paddingVertical: 25 }}>
            {text(
              "THE SMALLEST AGENT · Lesson 0 · React Native + Expo + TypeScript",
              true,
            )}
          </View>
        </View>
      </ScrollView>
      {!!c.notice && (
        <View
          accessibilityRole="alert"
          style={{
            position: "absolute",
            bottom: 20,
            left: 20,
            right: 20,
            backgroundColor: "#163352",
            padding: 18,
            borderRadius: 14,
          }}
        >
          <Text style={{ color: "white", fontSize: 18, lineHeight: 28 }}>
            {c.notice}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
