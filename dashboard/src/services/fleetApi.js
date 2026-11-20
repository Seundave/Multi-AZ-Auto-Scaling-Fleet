
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getFleetStatus = async () => {
  const response = await fetch(`${API_BASE_URL}/fleet`);

  if (!response.ok) {
    throw new Error(`Failed to fetch fleet status: ${response.status}`);
  }

  return response.json();
};
