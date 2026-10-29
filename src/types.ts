export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export type InputType = 'currency' | 'percentage' | 'number' | 'string' | 'date' | 'years' | 'months' | 'kg' | 'cm' | 'kcal' | 'ml' | 'bpm' | 'grams' | 'liters' | 'sq_meters' | 'cubic_meters' | 'pieces' | 'boxes' | 'bags' | 'select';

export interface SelectOption {
  value: number;
  label: string;
}

export interface InputField {
  id: string;
  label: string;
  type: InputType;
  required?: boolean;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  helpText?: string;
  options?: SelectOption[];
  /** 当指定时，此字段仅当 dependsOn.field 的值等于 dependsOn.value 时才显示 */
  dependsOn?: { field: string; value: number };
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface FormulaVariable {
  symbol: string;
  meaning: string;
}

export interface FormulaInfo {
  expression: string;
  explanation: string;
  variables: FormulaVariable[];
}

export interface GlossaryTerm {
  term: string;
  definition: string;
}

export interface DataSource {
  text: string;
  url?: string;
}

/** 关键词策略数据层（P0 审计落地）：每页一个主词 + 次词，附量级/难度/意图/优先级 */
export interface KeywordStrategy {
  /** 唯一主词 → 用于 H1 / meta description / 正文首段语义对齐 */
  primary: string;
  /** 次词（2-3 个）→ 用于 H2 / FAQ / 内部链接锚文本 */
  secondary: string[];
  /** 目标市场: us | uk | eu | global（欧美为主） */
  geo: 'us' | 'uk' | 'eu' | 'global';
  /** 搜索意图: informational | transactional | commercial | navigational */
  intent: 'informational' | 'transactional' | 'commercial' | 'navigational';
  /** 月搜索量（公开数据回填；未实测为 null 待 Keyword Planner） */
  volume: number | null;
  /** 关键词难度 0-100（公开数据回填；未实测为 null） */
  difficulty: number | null;
  /** 优先级: P0=KD<20 蓝海优先 / P1=KD 20-40 / P2=KD>40 只做长尾变体 */
  priority: 'P0' | 'P1' | 'P2';
}

export interface CalculatorConfig {
  id: string;
  slug: string;
  categoryId: string;
  title: string;
  h1?: string;
  description: string;
  icon: string;
  inputs: InputField[];
  faqs: FAQ[];
  formula?: FormulaInfo;
  tips?: string[];
  glossary?: GlossaryTerm[];
  dataSources?: DataSource[];
  keywords?: string[];
  keywordStrategy?: KeywordStrategy;
  howToCustom?: Array<{ name: string; text: string }>;
}

export interface ChartDataItem {
  name?: string;
  value?: number;
  [key: string]: string | number | undefined;
}

export interface ScheduleItem {
  [key: string]: string | number;
}

export interface CalculationResult {
  summary: Record<string, { label: string; value: string | number; type: InputType }>;
  chartData?: ChartDataItem[];
  schedule?: ScheduleItem[];
  extraData?: Record<string, { label: string; value: string | number; type: InputType }>;
}

export type FormulaFunction = (inputs: Record<string, number>) => CalculationResult;
