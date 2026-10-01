export function AuthorBadge({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height="29"
      viewBox="0 0 28 29"
      width="28"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="14" cy="14.6924" fill="black" r="14" />
      <path
        clipRule="evenodd"
        d="M8 10.6924L17.3265 12.2771L13.5305 18.1186H13.2075L12.6787 18.6452L12.1221 18.1186H11.9743L11.4376 18.654L10.9048 18.1186H10.7245L10.1907 18.6549L9.64042 18.1186H8L10.1667 18.9659L10.7496 18.6877L11.0768 19.3241L11.2404 19.3872L11.9091 19.0554L12.2597 19.7961L12.398 19.8427L11.9074 20.61L20.9126 10.6924H8Z"
        fill="white"
        fillRule="evenodd"
      />
      <path
        clipRule="evenodd"
        d="M9.5332 12.9429L13.3305 13.8476L11.6975 14.0275L9.5332 12.9429Z"
        fill="white"
        fillRule="evenodd"
      />
    </svg>
  );
}
