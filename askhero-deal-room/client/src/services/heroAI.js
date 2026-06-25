import { api } from "./api";

export async function fetchHeroAI(type, payload) {
  const path = {
    offer: "/ai/offer-suggestion",
    counter: "/ai/counter-analysis",
    closing: "/ai/closing-coach"
  }[type];
  const { data } = await api.post(path, payload);
  return data;
}
