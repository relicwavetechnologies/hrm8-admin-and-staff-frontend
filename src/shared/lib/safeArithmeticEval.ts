/**
 * Safe arithmetic expression evaluator – no eval(), no Function(), no dynamic code.
 * Supports: numbers, +, -, *, /, parentheses, decimal points.
 * Used by PivotCalculatedFields to evaluate formulas without eval().
 */

const SAFE_CHARS = /^[0-9+\-*/(). ]+$/;

/**
 * Evaluates a simple arithmetic expression containing numbers, +, -, *, /, (, ).
 * @throws Error if expression is invalid or contains unsafe characters
 */
export function safeArithmeticEval(expression: string): number {
  const trimmed = expression.replace(/\s/g, "");
  if (!trimmed) return 0;
  if (!SAFE_CHARS.test(trimmed)) {
    throw new Error("Invalid formula: only numbers and + - * / ( ) allowed");
  }

  let i = 0;
  const len = trimmed.length;
  const peek = () => (i < len ? trimmed[i] : "");
  const consume = () => (i < len ? trimmed[i++] : "");

  function parseNumber(): number {
    let s = "";
    while (/[0-9.]/.test(peek())) s += consume();
    const n = parseFloat(s);
    if (Number.isNaN(n)) throw new Error("Invalid number");
    return n;
  }

  function parseFactor(): number {
    if (peek() === "(") {
      consume();
      const v = parseExpr();
      if (consume() !== ")") throw new Error("Unmatched parenthesis");
      return v;
    }
    if (peek() === "-") {
      consume();
      return -parseFactor();
    }
    if (peek() === "+") consume();
    return parseNumber();
  }

  function parseTerm(): number {
    let left = parseFactor();
    for (;;) {
      const op = peek();
      if (op === "*") {
        consume();
        left *= parseFactor();
      } else if (op === "/") {
        consume();
        const right = parseFactor();
        if (right === 0) throw new Error("Division by zero");
        left /= right;
      } else break;
    }
    return left;
  }

  function parseExpr(): number {
    let left = parseTerm();
    for (;;) {
      const op = peek();
      if (op === "+") {
        consume();
        left += parseTerm();
      } else if (op === "-") {
        consume();
        left -= parseTerm();
      } else break;
    }
    return left;
  }

  const result = parseExpr();
  if (i < len) throw new Error("Invalid formula: unexpected character");
  return result;
}
