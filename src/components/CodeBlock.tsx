import React from "react";
import { ScrollView, Text, View, Pressable, Platform } from "react-native";
import Prism from "prismjs";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-json";
import "prismjs/components/prism-powershell";
import * as Clipboard from "expo-clipboard";
const colors: Record<string, string> = {
  keyword: "#c4a7ff",
  string: "#a8e6b5",
  comment: "#b0bed3",
  number: "#ffcb89",
  boolean: "#ffcb89",
  function: "#82d9ff",
  operator: "#ffabc5",
  property: "#82d9ff",
  punctuation: "#d6e1f3",
};
function tokens(items: (string | Prism.Token)[], key = ""): React.ReactNode {
  return items.map((item, i) =>
    typeof item === "string" ? (
      item
    ) : (
      <Text key={key + i} style={{ color: colors[item.type] || "#e7edfa" }}>
        {typeof item.content === "string"
          ? item.content
          : tokens(
              Array.isArray(item.content) ? item.content : [item.content],
              key + i + ".",
            )}
      </Text>
    ),
  );
}
export function CodeBlock({
  code,
  language = "typescript",
  label,
}: {
  code: string;
  language?: string;
  label?: string;
}) {
  const [copied, setCopied] = React.useState(false);
  return (
    <View
      style={{
        backgroundColor: "#14243c",
        borderRadius: 18,
        overflow: "hidden",
        marginVertical: 12,
      }}
    >
      <View
        style={{
          padding: 16,
          flexDirection: "row",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <Text style={{ color: "#c5d4ed", fontSize: 16, flex: 1 }}>
          {label || language}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copied ? "Code copied" : "Copy code"}
          onPress={() => {
            void Clipboard.setStringAsync(code)
              .then(() => setCopied(true))
              .catch(() => setCopied(false));
          }}
          style={{ minHeight: 44, minWidth: 60, padding: 8 }}
        >
          <Text style={{color: "#97d9ff", fontSize: 17}}>{copied ? "Copied" : "Copy"}</Text>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        contentContainerStyle={{ padding: 18, paddingTop: 0 }}
      >
        <Text
          selectable
          style={{
            fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
            fontSize: 18,
            lineHeight: 29,
            color: "#e7edfa",
          }}
        >
          {Prism.languages[language]
            ? tokens(Prism.tokenize(code, Prism.languages[language]))
            : code}
        </Text>
      </ScrollView>
    </View>
  );
}
