import { redirect } from "@sveltejs/kit";
const GET = async ({ url }) => {
  const code = url.searchParams.get("code");
  if (code) {
    const redirectTo = url.searchParams.get("redirect_to") ?? "/games";
    throw redirect(303, redirectTo);
  }
  throw redirect(303, "/auth/login?error=auth_failed");
};
export {
  GET
};
