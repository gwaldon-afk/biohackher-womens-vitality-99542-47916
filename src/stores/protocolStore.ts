// Zustand store for protocols
import { create } from 'zustand';
import { Protocol, ProtocolItem } from '@/types/protocols';

interface ProtocolStore {
  protocols: Protocol[];
  protocolItems: Map<string, ProtocolItem[]>;
  setProtocols: (protocols: Protocol[]) => void;
  addProtocol: (protocol: Protocol) => void;
  updateProtocol: (id: string, updates: Partial<Protocol>) => void;
  removeProtocol: (id: string) => void;
  setProtocolItems: (protocolId: string, items: ProtocolItem[]) => void;
  addProtocolItem: (protocolId: string, item: ProtocolItem) => void;
  updateProtocolItem: (protocolId: string, itemId: string, updates: Partial<ProtocolItem>) => void;
  removeProtocolItem: (protocolId: string, itemId: string) => void;
  clearAll: () => void;
}

export const useProtocolStore = create<ProtocolStore>((set) => ({
  protocols: [],
  protocolItems: new Map(),
  
  setProtocols: (protocols) => set({ protocols }),
  
  addProtocol: (protocol) => set((state) => ({
    protocols: [...state.protocols, protocol]
  })),
  
  updateProtocol: (id, updates) => set((state) => ({
    protocols: state.protocols.map(p => 
      p.id === id ? { ...p, ...updates } : p
    )
  })),
  
  removeProtocol: (id) => set((state) => {
    const newProtocolItems = new Map(state.protocolItems);
    newProtocolItems.delete(id);
    return {
      protocols: state.protocols.filter(p => p.id !== id),
      protocolItems: newProtocolItems
    };
  }),
  
  setProtocolItems: (protocolId, items) => set((state) => {
    const newProtocolItems = new Map(state.protocolItems);
    newProtocolItems.set(protocolId, items);
    return { protocolItems: newProtocolItems };
  }),
  
  addProtocolItem: (protocolId, item) => set((state) => {
    const newProtocolItems = new Map(state.protocolItems);
    const currentItems = newProtocolItems.get(protocolId) || [];
    newProtocolItems.set(protocolId, [...currentItems, item]);
    return { protocolItems: newProtocolItems };
  }),
  
  updateProtocolItem: (protocolId, itemId, updates) => set((state) => {
    const newProtocolItems = new Map(state.protocolItems);
    const currentItems = newProtocolItems.get(protocolId) || [];
    newProtocolItems.set(
      protocolId,
      currentItems.map(item => item.id === itemId ? { ...item, ...updates } : item)
    );
    return { protocolItems: newProtocolItems };
  }),
  
  removeProtocolItem: (protocolId, itemId) => set((state) => {
    const newProtocolItems = new Map(state.protocolItems);
    const currentItems = newProtocolItems.get(protocolId) || [];
    newProtocolItems.set(
      protocolId,
      currentItems.filter(item => item.id !== itemId)
    );
    return { protocolItems: newProtocolItems };
  }),
  
  clearAll: () => set({ protocols: [], protocolItems: new Map() })
}));
