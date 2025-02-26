import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>AI-GRID</h1>
      <p style={styles.description}>
        AI-GRID helps organizations of all sizes achieve <strong>ISO 42001 compliance</strong>.  
        Our survey adapts to your responses, guiding you through a tailored compliance process.
      </p>
      <button style={styles.button} onClick={() => router.push("/survey")}>
        Start Survey
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    textAlign: "center",
    backgroundColor: "#f4f4f9",
    padding: "5px",
  },
  title: {
    fontSize: "3rem",
    fontWeight: "bold",
    marginBottom: "10px",
    color: "#333",
  },
  description: {
    fontSize: "1.2rem",
    maxWidth: "600px",
    color: "#555",
    marginBottom: "20px",
  },
  button: {
    fontSize: "1.2rem",
    padding: "10px 20px",
    backgroundColor: "#0070f3",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background 0.3s",
  },
};
