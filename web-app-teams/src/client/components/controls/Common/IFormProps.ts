export interface IFormProps {
    formTitle: string;
    confirmLabel: string;
    onCancel: () => void;
    inProgress?: boolean;
}