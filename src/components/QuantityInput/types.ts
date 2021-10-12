export interface QuantityInputProps {
    name?: string;
    label?: string;
    min?: number;
    max?: number;
    step?: number;
    value?: number;
    onChange?: (val: number) => void;
}
