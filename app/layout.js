import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import "./globals.css";
import Loader from "./components/Loader";

export const metadata = {
  title: "College Clubs & Events",
  description: "Explore and join college clubs & events.",
};

export default function RootLayout({ children }) {
  const authResult = auth(); // This is fine on the server
  console.log('auth() result:', authResult);

  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <Loader />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
