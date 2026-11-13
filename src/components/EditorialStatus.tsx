interface EditorialStatusProps {
  children: string;
  retry?: () => void;
}

export default function EditorialStatus({ children, retry }: EditorialStatusProps) {
  return (
    <div className="border-y border-border py-8 text-muted-foreground" role="status">
      <p>{children}</p>
      {retry && (
        <button type="button" onClick={retry} className="editorial-link mt-4">
          Tentar novamente
        </button>
      )}
    </div>
  );
}
