// Copyright © 2026 Christopher Snow
import {
  EditorState,
  StateEffect,
  StateField,
  Compartment,
  EditorView,
  keymap,
  lineNumbers,
  gutter,
  GutterMarker,
  Decoration,
  drawSelection,
  highlightActiveLine,
  highlightSpecialChars,
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
  undo,
  redo,
  search,
  searchKeymap,
  openSearchPanel,
  highlightSelectionMatches,
  StreamLanguage,
  bracketMatching,
  indentOnInput,
  syntaxHighlighting,
  HighlightStyle,
  indentUnit,
  cpp,
  tags,
} from "../vendor/editor/codemirror.js";

// Highlight assembly notation only. GNU as remains the source of diagnostics.
const assembly = StreamLanguage.define({
  name: "riscv-assembly",
  startState: () => ({ operation: true }),
  token(stream, state) {
    if (stream.sol()) state.operation = true;
    if (stream.eatSpace()) return null;
    if (stream.match(/#.*/)) return "comment";
    if (stream.match(/"(?:[^"\\]|\\.)*"?/)) return "string";
    if (stream.match(/'(?:[^'\\]|\\.)*'?/)) return "string";
    if (stream.match(/[A-Za-z_.$][\w.$]*(?=:)/)) return "labelName";
    if (stream.match(/\.[A-Za-z_][\w.]*/)) {
      state.operation = false;
      return "meta";
    }
    if (stream.match(/[-+]?(?:0[xX][\da-fA-F]+|0[bB][01]+|\d+)\b/))
      return "number";
    if (
      stream.match(
        /(?:zero|ra|sp|gp|tp|fp|t[0-6]|s(?:1[01]|[0-9])|a[0-7]|x(?:3[01]|[12]\d|\d))\b/,
      )
    )
      return "variableName";
    if (stream.match(/%[A-Za-z_][\w.]*/)) return "operator";
    if (stream.match(/[A-Za-z_.$][\w.$]*/)) {
      if (state.operation) {
        state.operation = false;
        return "keyword";
      }
      return "name";
    }
    stream.next();
    return null;
  },
  languageData: { commentTokens: { line: "#" }, indentOnInput: /^\s*\w+:$/ },
});

const highlighting = HighlightStyle.define([
  {
    tag: tags.keyword,
    color: "var(--syntax-keyword, var(--accent))",
    fontWeight: "600",
  },
  {
    tag: [tags.variableName, tags.typeName],
    color: "var(--syntax-register, var(--ink))",
  },
  {
    tag: [tags.number, tags.bool],
    color: "var(--syntax-number, var(--accent))",
  },
  {
    tag: [tags.string, tags.character],
    color: "var(--syntax-string, var(--accent))",
  },
  { tag: tags.comment, color: "var(--muted)", fontStyle: "italic" },
  {
    tag: [tags.labelName, tags.meta],
    color: "var(--syntax-label, var(--accent))",
  },
  { tag: tags.operator, color: "var(--ink)" },
]);

const editorTheme = EditorView.theme({
  "&": { height: "100%", backgroundColor: "var(--code)", color: "var(--ink)" },
  ".cm-scroller": {
    overflow: "auto",
    fontFamily:
      "ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace",
  },
  ".cm-content": {
    minHeight: "100%",
    padding: "1rem 0",
    caretColor: "var(--accent)",
  },
  ".cm-line": { padding: "0 .8rem" },
  ".cm-gutters": {
    backgroundColor: "var(--soft)",
    color: "var(--muted)",
    borderRight: "1px solid var(--border)",
  },
  ".cm-gutterElement": {
    padding: "0 .4rem",
    minWidth: "2.5rem",
    textAlign: "right",
  },
  ".cm-source-breakpoints .cm-gutterElement": { padding: "0" },
  ".cm-breakpoint-button": {
    font: "inherit",
    lineHeight: "inherit",
    minHeight: "0",
    height: "100%",
    minWidth: "2.5rem",
    width: "100%",
    padding: "0 .4rem",
    border: "0",
    borderRadius: "0",
    background: "transparent",
    color: "inherit",
    textAlign: "right",
  },
  ".cm-breakpoint-button[aria-pressed=true]": {
    backgroundColor: "var(--notice)",
    color: "var(--accent)",
    boxShadow: "inset 3px 0 var(--accent)",
  },
  ".cm-breakpoint-button:focus-visible": {
    outline: "2px solid var(--accent)",
    outlineOffset: "-2px",
  },
  ".cm-execution-line": {
    backgroundColor: "var(--notice)",
    boxShadow: "inset 3px 0 var(--accent)",
  },
  ".cm-activeLine": { backgroundColor: "var(--soft)" },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
    backgroundColor: "color-mix(in srgb, var(--accent) 24%, transparent)",
  },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--accent)" },
  ".cm-panels": { backgroundColor: "var(--surface)", color: "var(--ink)" },
  ".cm-panels-bottom": { borderTop: "1px solid var(--border)" },
  ".cm-search": { padding: ".5rem", fontFamily: "inherit", lineHeight: "1.5" },
  ".cm-search .cm-textfield": {
    minWidth: "0",
    maxWidth: "100%",
    color: "var(--ink)",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    font: "inherit",
  },
  ".cm-search button": {
    color: "var(--ink)",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    minHeight: "32px",
    font: "inherit",
  },
  ".cm-searchMatch": {
    backgroundColor: "var(--notice)",
    outline: "1px solid var(--accent)",
  },
  ".cm-searchMatch-selected": {
    backgroundColor: "var(--accent)",
    color: "var(--accent-ink)",
  },
  "&.cm-focused": { outline: "2px solid var(--accent)", outlineOffset: "-2px" },
  ".cm-matchingBracket": {
    backgroundColor: "var(--notice)",
    outline: "1px solid var(--accent)",
  },
  ".cm-nonmatchingBracket": { color: "var(--error)" },
  "@media (max-width: 520px)": {
    ".cm-search button": { minHeight: "44px" },
    ".cm-search .cm-textfield": { minHeight: "44px", fontSize: "16px" },
  },
});

export function createSourceEditor(
  textarea,
  {
    language = "asm",
    breakpoints = true,
    onChange = () => {},
    onToggleBreakpoint = () => {},
  } = {},
) {
  const readOnly = new Compartment();
  const setDebug = StateEffect.define();
  let alive = true,
    lastReadOnly = false,
    changeQueued = false;
  let debug = { activeLine: null, breakpoints: [], disabled: false };
  const debugField = StateField.define({
    create: (state) => debugValue(state, debug),
    update(value, transaction) {
      if (transaction.docChanged)
        value = debugValue(transaction.state, {
          ...debug,
          activeLine: null,
          breakpoints: [],
        });
      for (const effect of transaction.effects)
        if (effect.is(setDebug))
          value = debugValue(transaction.state, effect.value);
      return value;
    },
    provide: (field) =>
      EditorView.decorations.from(field, (value) => value.decorations),
  });
  function debugValue(state, config) {
    const line = config.activeLine;
    return {
      ...config,
      decorations:
        line > 0 && line <= state.doc.lines
          ? Decoration.set([
              Decoration.line({ class: "cm-execution-line" }).range(
                state.doc.line(line).from,
              ),
            ])
          : Decoration.none,
    };
  }
  class BreakpointMarker extends GutterMarker {
    constructor(line, selected, disabled) {
      super();
      Object.assign(this, { line, selected, disabled });
    }
    eq(other) {
      return (
        this.line === other.line &&
        this.selected === other.selected &&
        this.disabled === other.disabled
      );
    }
    toDOM() {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "cm-breakpoint-button";
      button.textContent = this.line;
      button.dataset.breakpointLine = this.line;
      button.setAttribute(
        "aria-label",
        `${this.selected ? "Remove" : "Set"} breakpoint at source line ${this.line}`,
      );
      button.setAttribute("aria-pressed", String(this.selected));
      button.disabled = this.disabled;
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        onToggleBreakpoint(this.line);
      });
      return button;
    }
  }
  class SpacerMarker extends GutterMarker {
    toDOM() {
      const span = document.createElement("span");
      span.textContent = "000";
      return span;
    }
  }
  const breakpointGutter = gutter({
    class: "cm-source-breakpoints",
    lineMarker(view, line) {
      const number = view.state.doc.lineAt(line.from).number;
      const state = view.state.field(debugField);
      return new BreakpointMarker(
        number,
        state.breakpoints.includes(number),
        state.disabled,
      );
    },
    lineMarkerChange: (update) =>
      update.startState.field(debugField) !== update.state.field(debugField),
    initialSpacer: () => new SpacerMarker(),
  });
  const attributes = {
    "aria-label": textarea.getAttribute("aria-label") ?? "Lesson source",
    "aria-describedby": textarea.getAttribute("aria-describedby") ?? "",
    spellcheck: "false",
    autocapitalize: "off",
    autocorrect: "off",
    autocomplete: "off",
  };
  const extensions = [
    history(),
    drawSelection(),
    highlightActiveLine(),
    highlightSpecialChars(),
    bracketMatching(),
    indentOnInput(),
    indentUnit.of("    "),
    search({ top: false }),
    highlightSelectionMatches(),
    syntaxHighlighting(highlighting),
    language === "c" ? cpp() : assembly,
    language === "c" || !breakpoints ? lineNumbers() : breakpointGutter,
    keymap.of([
      ...searchKeymap,
      ...historyKeymap,
      indentWithTab,
      ...defaultKeymap,
      ...(language === "c" || !breakpoints
        ? []
        : [
            {
              key: "F9",
              run(view) {
                if (view.state.field(debugField).disabled) return false;
                onToggleBreakpoint(
                  view.state.doc.lineAt(view.state.selection.main.head).number,
                );
                return true;
              },
            },
          ]),
    ]),
    readOnly.of([EditorState.readOnly.of(false), EditorView.editable.of(true)]),
    debugField,
    editorTheme,
    EditorView.editorAttributes.of({
      class: `source-code-editor language-${language}`,
    }),
    EditorView.contentAttributes.of(attributes),
    EditorView.updateListener.of((update) => {
      if (!update.docChanged) return;
      textarea.value = update.state.doc.toString();
      if (!changeQueued) {
        changeQueued = true;
        queueMicrotask(() => {
          changeQueued = false;
          if (alive) onChange();
        });
      }
    }),
  ];
  const makeState = (doc) => EditorState.create({ doc, extensions });
  const view = new EditorView({ state: makeState(textarea.value) });
  textarea.after(view.dom);
  function exposeBreakpoints() {
    if (language === "c" || !breakpoints) return;
    // CodeMirror hides decorative gutters from assistive technology. These
    // line numbers are controls, so expose their group and named buttons.
    const gutters = view.dom.querySelector(".cm-gutters");
    gutters.removeAttribute("aria-hidden");
    gutters.setAttribute("role", "group");
    gutters.setAttribute("aria-label", "Source breakpoints");
  }
  exposeBreakpoints();
  const originalDisplay = textarea.style.display;
  textarea.hidden = true;
  textarea.style.display = "none";
  textarea.tabIndex = -1;
  return {
    get value() {
      return view.state.doc.toString();
    },
    set value(value) {
      textarea.value = String(value);
      view.setState(makeState(String(value)));
      exposeBreakpoints();
      if (lastReadOnly)
        view.dispatch({
          effects: readOnly.reconfigure([
            EditorState.readOnly.of(true),
            EditorView.editable.of(false),
          ]),
        });
    },
    get readOnly() {
      return lastReadOnly;
    },
    set readOnly(value) {
      value = Boolean(value);
      if (value === lastReadOnly) return;
      lastReadOnly = value;
      view.dispatch({
        effects: readOnly.reconfigure([
          EditorState.readOnly.of(value),
          EditorView.editable.of(!value),
        ]),
      });
      textarea.readOnly = value;
    },
    focus(options = {}) {
      view.contentDOM.focus(options);
    },
    setSelectionRange(start, end = start) {
      const clamp = (n) => Math.max(0, Math.min(view.state.doc.length, n));
      view.dispatch({
        selection: { anchor: clamp(start), head: clamp(end) },
        scrollIntoView: true,
      });
    },
    scrollToLine(line, { contained = false } = {}) {
      const number = Math.max(1, Math.min(view.state.doc.lines, line));
      if (contained) {
        const block = view.lineBlockAt(view.state.doc.line(number).from);
        view.scrollDOM.scrollTo({
          top: block.top - (view.scrollDOM.clientHeight - block.height) / 2,
          behavior: "instant",
        });
        return;
      }
      view.dispatch({
        effects: EditorView.scrollIntoView(view.state.doc.line(number).from, {
          y: "center",
        }),
      });
    },
    renderState({
      activeLine = null,
      breakpoints = [],
      disabled = false,
    } = {}) {
      debug = { activeLine, breakpoints: [...breakpoints], disabled };
      const focused = view.dom.querySelector(".cm-breakpoint-button:focus");
      const line = focused?.dataset.breakpointLine;
      view.dispatch({ effects: setDebug.of(debug) });
      if (line)
        view.dom
          .querySelector(`[data-breakpoint-line="${line}"]`)
          ?.focus({ preventScroll: true });
    },
    openSearch() {
      openSearchPanel(view);
    },
    undo() {
      return undo(view);
    },
    redo() {
      return redo(view);
    },
    get dom() {
      return view.dom;
    },
    get contentDOM() {
      return view.contentDOM;
    },
    get scrollDOM() {
      return view.scrollDOM;
    },
    destroy() {
      alive = false;
      view.destroy();
      textarea.hidden = false;
      textarea.style.display = originalDisplay;
      textarea.removeAttribute("tabindex");
    },
  };
}
