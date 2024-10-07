export interface SearchProps {
  defaultValue?: string;
  value?: string;
  disabled?: boolean;
  placeholder?: string;
  onChange?: (value: string) => void;
  minSearchLength?: number;
}
