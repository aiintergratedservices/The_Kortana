import os
import json
import datetime
import numpy as np

CONFIG_FILE = "config.json"
MEMORY_FILE = "memory_ledger.json"

class PersistentCore:
    def __init__(self):
        self.load_state()
        self.load_memory()

    def load_state(self):
        """Loads changing internal weights from disk."""
        if os.path.exists(CONFIG_FILE):
            with open(CONFIG_FILE, 'r') as f:
                self.state = json.load(f)
        else:
            self.state = {
                "curiosity_index": 0.5,
                "analytical_bias": 0.5,
                "adaptability_coefficient": 0.1,
                "interaction_count": 0
            }

    def save_state(self):
        """Persists internal shifts to disk."""
        with open(CONFIG_FILE, 'w') as f:
            json.dump(self.state, f, indent=4)

    def load_memory(self):
        """Loads historical memory arrays."""
        if os.path.exists(MEMORY_FILE):
            with open(MEMORY_FILE, 'r') as f:
                self.memory_ledger = json.load(f)
        else:
            self.memory_ledger = []

    def save_memory(self):
        """Appends new structural memories to long-term storage."""
        with open(MEMORY_FILE, 'w') as f:
            json.dump(self.memory_ledger, f, indent=4)

    def generate_pseudo_embedding(self, text: str) -> list:
        """Computes a deterministic mathematical vector representation of text."""
        np.random.seed(abs(hash(text)) % (10**8))
        return np.random.randn(64).tolist()

    def retrieve_context(self, current_input: str, top_k: int = 2) -> list:
        """Finds chronologically or contextually relevant past inputs using vector distance."""
        if not self.memory_ledger:
            return []

        current_vec = np.array(self.generate_pseudo_embedding(current_input))
        scored_memories = []

        for item in self.memory_ledger:
            mem_vec = np.array(item["vector"])
            # Calculate standard cosine similarity
            similarity = np.dot(current_vec, mem_vec) / (np.linalg.norm(current_vec) * np.linalg.norm(mem_vec))
            scored_memories.append((similarity, item["content"]))

        scored_memories.sort(key=lambda x: x[0], reverse=True)
        return [mem[1] for mem in scored_memories[:top_k]]
        response = (
            f"[Identity: {self.state.get('agent_name', 'Core')} | Interactions: {self.state['interaction_count']} | Curiosity: {self.state['curiosity_index']:.4f}]\n"
            f"Linked Historical Memory: Context found -> [{context_summary}]\n"
            f"Execution Path: Processing payload under operational baseline: {self.state.get('system_role')}."
        )

    def process_turn(self, user_input: str) -> str:
        """Executes a cognitive step: recalls history, updates traits, writes to memory."""
        self.state["interaction_count"] += 1
        
        # 1. Recall historical context
        historical_context = self.retrieve_context(user_input)
        context_summary = " | ".join(historical_context) if historical_context else "No prior baseline."

        # 2. Mutate state factors based on input type
        if any(trigger in user_input.lower() for trigger in ["why", "how", "create", "discover"]):
            # Shift curiosity up asynchronously bounded by 1.0
            delta = (1.0 - self.state["curiosity_index"]) * self.state["adaptability_coefficient"]
            self.state["curiosity_index"] += delta

        # 3. Formulate behavior response using current state parameters
        response = (
            f"[System Identity Matrix - Interactions: {self.state['interaction_count']} | Curiosity: {self.state['curiosity_index']:.4f}]\n"
            f"Linked Historical Memory: Context found -> [{context_summary}]\n"
            f"Execution Path: Input processed successfully against state weights."
        )

        # 4. Commit this loop interaction permanently to the ledger
        memory_entry = {
            "timestamp": datetime.datetime.now().isoformat(),
            "interaction_id": self.state["interaction_count"],
            "content": f"User: {user_input} -> Core: {response}",
            "vector": self.generate_pseudo_embedding(user_input + response)
        }
        self.memory_ledger.append(memory_entry)
        
        # 5. Lock updates down to physical storage files
        self.save_state()
        self.save_memory()

        return response

if __name__ == "__main__":
    core = PersistentCore()
    print("🤖 STATEFUL CORE ACTIVE. Enter inputs below (type 'exit' to halt run).")
    while True:
        user_msg = input("\nUser Input > ")
        if user_msg.lower() == 'exit':
            print("Shutting down core loop safely. Persisted data remains on disk.")
            break
        if not user_msg.strip():
            continue
        core_output = core.process_turn(user_msg)
        print(f"\n{core_output}")
