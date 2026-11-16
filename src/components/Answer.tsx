import React from "react";
import { Text, View, Linking } from "react-native";
import { CodeBlock } from "./CodeBlock";
export function Answer({ text, color }: { text: string; color: string }) {
  // Model output becomes native Text nodes, never executable HTML or a WebView.
  return (
    <View>
      {text.split(/(```[\s\S]*?```)/g).map((part, i) => {
        if (part.startsWith("```")) {
          const match = /^```([^\n]*)\n([\s\S]*?)```$/.exec(part);
          return (
            <CodeBlock
              key={i}
              language={match?.[1].trim() || "text"}
              code={match?.[2] || part}
            />
          );
        }
        return part.split("\n").map((line, j) => (
          <Text
            selectable
            accessibilityRole={/^#{1,6} /.test(line) ? "header" : "text"}
            key={`${i}-${j}`}
            style={{
              color,
              fontSize: 21,
              lineHeight: 34,
              marginBottom: 7,
              fontWeight: /^#{1,6} /.test(line) ? "700" : "400",
            }}
          >
            {line
              .replace(/^#{1,6} /, "")
              .split(/(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g)
              .map((piece, k) => {
                const link = /^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/.exec(
                  piece,
                );
                if (link)
                  return (
                    <Text
                      key={k}
                      accessibilityRole="link"
                      onPress={() => {
                        void Linking.openURL(link[2]);
                      }}
                      style={{
                        color: "#0969c6",
                        textDecorationLine: "underline",
                      }}
                    >
                      {link[1]}
                    </Text>
                  );
                return (
                  <Text
                    key={k}
                    style={
                      piece.startsWith("**") ? { fontWeight: "700" } : undefined
                    }
                  >
                    {piece.startsWith("**") ? piece.slice(2, -2) : piece}
                  </Text>
                );
              })}
          </Text>
        ));
      })}
    </View>
  );
}
