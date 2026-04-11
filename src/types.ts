export type ExportNote = {
  id: string;
  title: string;
  body: string;
  notebook: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isTodo: boolean;
  todoCompleted: boolean;
};

export type ManifestEntry = {
  noteId: string;
  filePath: string;
  updatedAt: string;
  contentHash: string;
  metadataHash: string;
  syncedAt: string;
  title: string;
};

export type DeleteEntry = {
  noteId: string;
  deletedAt: string;
  lastKnownTitle: string;
};

export type SyncSummary = {
  created: number;
  updated: number;
  deleted: number;
  skipped: number;
  errors: Array<{ noteId?: string; message: string }>;
};
