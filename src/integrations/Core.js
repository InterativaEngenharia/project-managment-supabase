// Substitui o módulo virtual "@/integrations/Core" que antes era gerado
// pelo plugin @base44/vite-plugin. Resolve o import usado em
// src/components/empreendimentos/EmpreendimentoForm.jsx:
//   import { UploadFile } from "@/integrations/Core";

import { base44 } from '@/api/base44Client';

export const Core = base44.integrations.Core;

export const UploadFile = base44.integrations.Core.UploadFile;
export const SendEmail = base44.integrations.Core.SendEmail;
// Removido: SendSMS, GenerateImage, InvokeLLM (não implementados, sem uso conhecido)
export const ExtractDataFromUploadedFile = base44.integrations.Core.ExtractDataFromUploadedFile;

export default Core;
