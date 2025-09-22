// Lightweight browser-safe event emitter compatible with Node's EventEmitter API used in this app

export type EventPayload = any;
export type EventListener = (payload?: EventPayload) => void;

export class Emitter {
    private target: EventTarget = new EventTarget();
    private listenerRegistry: Map<string, Set<EventListener>> = new Map();

    on(event: string, listener: EventListener): this {
        const wrapper = (e: Event) => listener((e as CustomEvent).detail);
        this.target.addEventListener(event, wrapper as EventListener);
        if (!this.listenerRegistry.has(event)) this.listenerRegistry.set(event, new Set());
        this.listenerRegistry.get(event)!.add(wrapper as EventListener);
        return this;
    }

    off(event: string, listener: EventListener): this {
        const wrappers = this.listenerRegistry.get(event);
        if (wrappers && wrappers.has(listener)) {
            this.target.removeEventListener(event, listener as EventListener);
            wrappers.delete(listener);
        }
        return this;
    }

    emit(event: string, payload?: EventPayload): boolean {
        return this.target.dispatchEvent(new CustomEvent(event, { detail: payload }));
    }

    removeAllListeners(event?: string): this {
        if (event) {
            const wrappers = this.listenerRegistry.get(event);
            if (wrappers) {
                for (const w of wrappers) this.target.removeEventListener(event, w as EventListener);
                this.listenerRegistry.delete(event);
            }
            return this;
        }
        for (const [evt, wrappers] of this.listenerRegistry.entries()) {
            for (const w of wrappers) this.target.removeEventListener(evt, w as EventListener);
        }
        this.listenerRegistry.clear();
        return this;
    }
}



