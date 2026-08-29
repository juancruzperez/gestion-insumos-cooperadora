type Listener = (payload: string) => void;
const listeners = new Set<Listener>();
export function subscribe(listener: Listener) { listeners.add(listener); return () => listeners.delete(listener); }
export function publishNotification(event: unknown) { const payload = JSON.stringify(event); listeners.forEach((listener) => listener(payload)); }
