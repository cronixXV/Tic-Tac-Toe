module.exports = {
  /**
   * Рекомендуемая длина строки
   * @type number
   * @default 80
   */
  printWidth: 80,

  /**
   * Размер табуляции (в пробелах)
   * @type number
   * @default 2
   */
  tabWidth: 2,

  /**
   * Использовать табы вместо пробелов
   * @type boolean
   * @default false
   */
  useTabs: true,

  /**
   * Добавлять автоматически точки с запятой
   * @type boolean
   * @default true
   */
  semi: true,

  /**
   * Использовать одинарные кавычки, где это возможно (игнорируется в JSX)
   * @type boolean
   * @default false
   */
  singleQuote: true,

  /**
   * Использовать одинарные кавычки вместо двойных в JSX
   * @type boolean
   * @default false
   */
  jsxSingleQuote: false,

  /**
   * Ставить запятые в конце многострочных структур, разделяемых запятыми
   * @type string "es5" | "none" | "all"
   * @default "es5"
   */
  trailingComma: "all",

  /**
   * Оборачивать в скобки единственный параметр стрелочной функции
   * @type string "always" | "avoid"
   * @default "always"
   */
  arrowParens: "always",

  /**
   * Добавлять пробелы между фигурными скобками
   * @type boolean
   * @default true
   */
  bracketSpacing: true,

  /**
   * Оборачивать ключи свойств объектов в кавычки
   * @type string "as-needed" | "consistent" | "preserve"
   * @default "as-needed"
   */
  quoteProps: "as-needed",

  /**
   * Настраивает логику переноса текста для Markdown
   * @type string "always" | "never" | "preserve"
   * @default "preserve"
   */
  proseWrap: "preserve",

  /**
   * Задаёт глобальную чувствительность к пробелам внутри тегов в HTML, Vue, Angular и т.д.
   * @type string "css" | "strict" | "ignore"
   * @default "css"
   */
  htmlWhitespaceSensitivity: "css",

  /**
   * Делать отступ для кода внутри <script> и <style> тегов в файлах Vue
   * @type boolean
   * @default false
   */
  vueIndentScriptAndStyle: false,

  /**
   * Позволяет указать каким "знаком переноса" должны заканчиваться строки/линии
   * @type string "lf" | "crlf" | "cr" | "auto"
   * @default "lf"
   */
  endOfLine: "lf",

  /**
   * Расставлять атрибуты html тегов только по одному в строку (для HTML, Vue и JSX документов)
   * @type boolean
   * @default false
   */
  singleAttributePerLine: true,

  /**
   * Оставлять знак `>` многострочного HTML элемента (HTML, JSX, Vue, Angular) в тойже строке
   * что и последний параметр
   * @type boolean
   * @default false
   */
  bracketSameLine: true,

  /**
   * Контролирует форматирование кода в кавычках
   * @type string "auto" | "off"
   * @default "auto"
   */
  embeddedLanguageFormatting: "auto",

  /**
   * Добавлять метку "@format" в отформатированные файлы
   * @type boolean
   * @default false
   */
  insertPragma: false,

  /**
   * Форматировать только документы с меткой "@prettier"
   * @type boolean
   * @default false
   */
  requirePragma: false,
};
