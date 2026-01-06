import { useState } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";

interface Props {
  onSuccess: () => void;
}

export function CreateNodeDialog({ onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nodeId, setNodeId] = useState("");
  const [ip, setIp] = useState("10.10.0.");

  const handleSubmit = async () => {
    if (!nodeId || !ip) return;
    setLoading(true);
    try {
      await axios.post(`/api/nodes/provision?node_id=${nodeId}&ip=${ip}`);
      setOpen(false);
      onSuccess(); // Rafraichir la liste parente
      setNodeId("");
    } catch (err: any) {
      alert("Erreur: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20">
          <Plus className="mr-2 h-4 w-4" /> Provision Node
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-neutral-900 border-neutral-800 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Deploy New Storage Node</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-neutral-400">Node Identifier</Label>
            <Input 
              id="name" 
              value={nodeId} 
              onChange={(e) => setNodeId(e.target.value)} 
              placeholder="ex: node-storage-04" 
              className="bg-neutral-950 border-neutral-700 focus-visible:ring-blue-600"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ip" className="text-neutral-400">IP Address (veth)</Label>
            <Input 
              id="ip" 
              value={ip} 
              onChange={(e) => setIp(e.target.value)} 
              placeholder="10.10.0.x" 
              className="bg-neutral-950 border-neutral-700 focus-visible:ring-blue-600"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} className="border-neutral-700 text-neutral-300">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Deploy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}