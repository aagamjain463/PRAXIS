import { signOutAction } from "../../lib/auth/actions";
import { SignOutSubmit } from "./sign-out-submit";

// Server-rendered sign-out: works without JavaScript, with a pending label
// when JavaScript is available.
export function SignOutButton({ className }: { className?: string }) {
  return (
    <form action={signOutAction}>
      <SignOutSubmit className={className} />
    </form>
  );
}
