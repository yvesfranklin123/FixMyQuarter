export type FileStatus = 'uploading' | 'completed' | 'error' | 'encrypted';

export interface NexusFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  cid: string; // Content Identifier (IPFS/Decentralized)
  ownerId: string;
  parentId: string | null;
  createdAt: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  tier: 'free' | 'pro' | 'enterprise';
  storageUsed: number;
  storageLimit: number;
}