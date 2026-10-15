import { Link } from "react-router-dom";
import { EmptyState } from "../components/Feedback";

export default function NotFound() {
  return (
    <EmptyState title="Page not found" text="That address doesn't match any page in Orbit Atlas.">
      <Link className="btn btn-primary" to="/">
        Back to home
      </Link>
    </EmptyState>
  );
}
