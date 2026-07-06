// Substitui o módulo virtual "@/integrations/Core" que antes era gerado
// pelo plugin @base44/vite-plugin. Resolve o import usado em
// src/components/empreendimentos/EmpreendimentoForm.jsx:
//   import { UploadFile } from "@/integrations/Core";

import { base44 } from '@/api/base44Client';

export const Core = base44.integrations.Core;

export const UploadFile = base44.integrations.Core.UploadFile;
export const SendEmail = base44.integrations.Core.SendEmail;
export const SendSMS = base44.integrations.Core.SendSMS;
export const GenerateImage = base44.integrations.Core.GenerateImage;
export const InvokeLLM = base44.integrations.Core.InvokeLLM;
export const ExtractDataFromUploadedFile = base44.integrations.Core.ExtractDataFromUploadedFile;

export default Core;
