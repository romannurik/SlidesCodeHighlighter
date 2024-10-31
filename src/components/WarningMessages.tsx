/*
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useMemo } from "react";
import { cleanupCode } from "../cleanup-code";
import { useConfig } from "../Config";
import { Message, MessageList } from "./MessageList";

const WARN_LINES = 15;
const WARN_LINE_LENGTH = 80;

export function WarningMessages() {
  let [config] = useConfig();

  let messages: Message[] = useMemo(() => {
    let messages: Message[] = [];
    let { leadingEmptyLines, code } = cleanupCode(
      config.code,
      config.tabSize
    );
    if ((code.match(/\n/g) || []).length >= WARN_LINES) {
      messages.push({
        type: "warning",
        message: `More than ${WARN_LINES} lines of code will be hard to read in a
          slide presentation.`,
      });
    }

    let lines = code.split("\n") || [];

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].length > WARN_LINE_LENGTH) {
        messages.push({
          type: "warning",
          message: `Line ${
            i + 1 + leadingEmptyLines
          } has more than ${WARN_LINE_LENGTH} characters!`,
        });
        break;
      }
    }

    return messages;
  }, [config.code, config.tabSize]);

  return <MessageList messages={messages} />;
}
