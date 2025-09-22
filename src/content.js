// Google Meet Auto Transcript - 文字起こし自動有効化
// より堅牢で安定したバージョン

(() => {
  "use strict";

  // ユーティリティ関数
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const visible = (el) => !!el && el.offsetParent !== null;
  const byText = (re, root = document) =>
    Array.from(root.querySelectorAll("*")).filter(
      (el) =>
        visible(el) &&
        re.test(
          (el.textContent || "") + " " + (el.getAttribute?.("aria-label") || "")
        )
    );

  // 処理状態を追跡するフラグ
  let isProcessing = false;
  let lastProcessTime = 0;
  let attemptCount = 0;
  const maxAttempts = 2;

  // 文字起こしが既に有効かチェックする関数
  const isTranscriptAlreadyActive = () => {
    console.log(
      "Google Meet Auto Transcript: Checking if transcript is already active..."
    );

    // 指定されたテキストをチェック
    const transcriptActiveMessages = byText(
      /この通話は文字起こしされます|このビデオ会議は文字起こしされています|参加すると Gemini がメモを作成します|transcription.*active|recording.*active/i
    );

    if (transcriptActiveMessages.length > 0) {
      console.log(
        "Google Meet Auto Transcript: Transcript is already active - found active message"
      );
      return true;
    }

    // その他の文字起こし有効状態の表示をチェック
    const otherActiveIndicators = byText(
      /文字起こし.*開始|transcription.*started/i
    );
    if (otherActiveIndicators.length > 0) {
      console.log(
        "Google Meet Auto Transcript: Transcript appears to be active - found started indicator"
      );
      return true;
    }

    console.log("Google Meet Auto Transcript: Transcript is not active");
    return false;
  };

  // メイン処理関数
  const autoEnableTranscript = async () => {
    // 処理中または最近処理した場合はスキップ
    const now = Date.now();
    if (isProcessing || now - lastProcessTime < 5000) {
      console.log(
        "Google Meet Auto Transcript: Skipping - recently processed or processing"
      );
      return false;
    }

    // 最大試行回数に達した場合は諦める
    if (attemptCount >= maxAttempts) {
      console.log(
        `Google Meet Auto Transcript: Max attempts (${maxAttempts}) reached, giving up`
      );
      return false;
    }

    // 文字起こしが既に有効な場合は処理を終了
    if (isTranscriptAlreadyActive()) {
      console.log(
        "Google Meet Auto Transcript: Transcript is already active, stopping processing"
      );
      return true; // 成功として扱う
    }

    isProcessing = true;
    lastProcessTime = now;
    attemptCount++;

    console.log(
      `Google Meet Auto Transcript: Starting auto transcript (attempt ${attemptCount}/${maxAttempts})`
    );

    try {
      // Step 0: 右側の「会議メモ」パネルが閉じていたら開く
      const openNotesPanelIfNeeded = async () => {
        console.log(
          "Google Meet Auto Transcript: Checking if notes panel is open..."
        );

        // 既に見えている？
        const panel = byText(/会議メモ|Notes|Gemini|文字起こし/i).find((el) =>
          el.closest('[role="dialog"], [role="region"], aside, section')
        );
        if (panel) {
          console.log(
            "Google Meet Auto Transcript: Notes panel is already open"
          );
          return true;
        }

        console.log(
          "Google Meet Auto Transcript: Looking for notes panel button..."
        );

        // 右レールのアイコンから開く（aria or tooltipテキストで推測）
        const railBtn = Array.from(
          document.querySelectorAll(
            'button[aria-label], [role="button"][aria-label], button'
          )
        ).find((b) =>
          /会議メモ|メモ|Notes|Gemini/i.test(
            b.getAttribute("aria-label") || b.innerText || ""
          )
        );

        if (!railBtn) {
          console.log(
            "Google Meet Auto Transcript: Notes panel button not found"
          );
          return false;
        }

        console.log("Google Meet Auto Transcript: Clicking notes panel button");
        railBtn.click();
        await sleep(1000); // パネルが開くまで待機
        return true;
      };

      // Step 1: パネル内で「文字起こしも開始する」にチェックを入れる
      const ensureTranscriptionChecked = () => {
        console.log(
          "Google Meet Auto Transcript: Looking for transcription checkbox..."
        );

        const label = byText(/文字起こしも開始する/i).find(
          (el) =>
            el.tagName === "LABEL" ||
            /checkbox|button|switch/i.test(el.getAttribute?.("role") || "") ||
            el.querySelector('input[type="checkbox"]')
        );

        if (!label) {
          console.log(
            "Google Meet Auto Transcript: Transcription checkbox label not found"
          );
          return false;
        }

        console.log(
          "Google Meet Auto Transcript: Found transcription checkbox label"
        );

        // for属性優先
        const forId = label.getAttribute?.("for");
        let cb = forId ? document.getElementById(forId) : null;
        if (!cb) {
          cb =
            label.querySelector?.('input[type="checkbox"]') ||
            label
              .closest('div, section, [role="group"]')
              ?.querySelector('input[type="checkbox"]');
        }

        if (!cb) {
          console.log(
            "Google Meet Auto Transcript: Transcription checkbox input not found"
          );
          return false;
        }

        if (!cb.checked) {
          console.log(
            "Google Meet Auto Transcript: Checking transcription checkbox"
          );
          // ラベルクリック or inputクリック
          (forId ? label : cb).click();
        } else {
          console.log(
            "Google Meet Auto Transcript: Transcription checkbox is already checked"
          );
        }
        return true;
      };

      // Step 2: 「メモの作成を開始（…）」ボタンを押す → これで文字起こしセッションも開始される
      const clickStartNotes = () => {
        console.log(
          "Google Meet Auto Transcript: Looking for start notes button..."
        );

        const startBtn = byText(
          /メモの作成を開始|メモの作成を続行|Start taking notes|Start notes|確認/i
        ).find(
          (el) =>
            el.tagName === "BUTTON" ||
            /button/i.test(el.getAttribute?.("role") || "")
        );

        console.log("startBtn", startBtn);

        if (!startBtn) {
          console.log(
            "Google Meet Auto Transcript: Start notes button not found"
          );
          return false;
        }

        console.log("Google Meet Auto Transcript: Clicking start notes button");
        startBtn.click();
        return true;
      };

      // Step 3: 確認ダイアログが出る環境向けフォロー
      const handleConfirmDialog = async () => {
        console.log(
          "Google Meet Auto Transcript: Checking for confirmation dialog..."
        );
        await sleep(500);

        const confirm = byText(
          /^(開始|同意して開始|Start|確認|OK)$|メモの作成を開始|Start taking notes/i
        ).find((el) => {
          const isButton =
            el.tagName === "BUTTON" ||
            /button/i.test(el.getAttribute?.("role") || "");
          const ariaLabel = el.getAttribute?.("aria-label") || "";
          const textContent = el.textContent || "";

          // マイクボタンを除外
          if (
            /マイク|mic/i.test(ariaLabel) ||
            /マイク|mic/i.test(textContent)
          ) {
            return false;
          }

          return isButton;
        });

        if (confirm) {
          console.log(
            "Google Meet Auto Transcript: Clicking confirmation button"
          );
          confirm.click();
          return true;
        }

        console.log(
          "Google Meet Auto Transcript: No confirmation dialog found"
        );
        return false;
      };

      // 実行シーケンス

      // Step -1: 「しばらくお待ちください」メッセージがある場合は待機
      const checkWaitingMessage = () => {
        console.log(
          "Google Meet Auto Transcript: Checking for waiting message..."
        );

        const waitingMessage = byText(
          /しばらくお待ちください|Please wait|Loading|読み込み中/i
        );

        if (waitingMessage.length > 0) {
          console.log(
            "Google Meet Auto Transcript: 'Please wait' message found"
          );
          return true; // 待機メッセージがある
        }

        console.log("Google Meet Auto Transcript: No waiting message");
        return false; // 待機メッセージがない
      };

      while (checkWaitingMessage()) {
        console.log(
          "Google Meet Auto Transcript: Waiting message detected, sleeping for 3 seconds..."
        );
        await sleep(3000);
      }

      console.log(
        "Google Meet Auto Transcript: No waiting message, proceeding..."
      );

      if (!(await openNotesPanelIfNeeded())) {
        console.warn(
          "Google Meet Auto Transcript: ❌ 右側の会議メモパネルを開けませんでした"
        );
        isProcessing = false;
        return false;
      }

      await sleep(500);

      if (!ensureTranscriptionChecked()) {
        console.warn(
          "Google Meet Auto Transcript: ⚠️ 「文字起こしも開始する」のチェックが見つからない/入れられない"
        );
        // チェックが見つからなくても先に進む（既定でONの可能性）
      }

      await sleep(3000);

      if (clickStartNotes()) {
        console.log(
          "Google Meet Auto Transcript: ✅ 右パネルからメモ開始→文字起こし開始をトリガーしました"
        );

        // 確認ダイアログの処理
        // await handleConfirmDialog();

        console.log(
          "Google Meet Auto Transcript: Process completed successfully!"
        );
        isProcessing = false;
        return true;
      } else {
        console.warn(
          "Google Meet Auto Transcript: ❌ 「メモの作成を開始」ボタンが見つかりませんでした"
        );
        isProcessing = false;
        return false;
      }
    } catch (error) {
      console.error(
        "Google Meet Auto Transcript: Error during processing:",
        error
      );
      isProcessing = false;
      return false;
    }
  };

  // ページの変更を監視する関数
  function observePageChanges() {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          setTimeout(() => {
            if (!isProcessing && attemptCount < maxAttempts) {
              autoEnableTranscript();
            }
          }, 2000);
          break;
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return observer;
  }

  // 初期化関数
  function initialize() {
    console.log("Google Meet Auto Transcript: Initializing...");

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        setTimeout(autoEnableTranscript, 3000);
      });
    } else {
      setTimeout(autoEnableTranscript, 3000);
    }

    observePageChanges();

    // 定期的にチェック（会議中にUIが変わる可能性があるため）
    setInterval(() => {
      // 最大試行回数に達した場合はスキップ
      if (attemptCount >= maxAttempts) {
        return;
      }

      // 処理中の場合はスキップ
      if (isProcessing) {
        return;
      }

      // 既に文字起こしが開始されているかチェック（新しい関数を使用）
      if (isTranscriptAlreadyActive()) {
        console.log(
          "Google Meet Auto Transcript: Transcription is already active, skipping periodic check"
        );
        return;
      }

      console.log(
        "Google Meet Auto Transcript: Periodic check - attempting to enable transcript"
      );
      autoEnableTranscript();
    }, 30000); // 30秒ごとにチェック
  }

  // Google Meetのページかどうかを確認
  if (window.location.hostname === "meet.google.com") {
    initialize();
  }
})();
