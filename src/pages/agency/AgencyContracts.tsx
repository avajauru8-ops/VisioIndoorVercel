import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { FileText, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import { format } from 'date-fns';

export default function AgencyContracts() {
  const [profile, setProfile] = useState<any>({});
  
  // Client Data
  const [nome, setNome] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [endereco, setEndereco] = useState('');
  
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await apiFetch('/api/agency/profile');
        setProfile(data || {});
      } catch (err) {
        console.error(err);
      }
    };
    loadProfile();
  }, []);

  const generatePDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    let y = margin;
    
    // Header
    doc.setFontSize(18);
    doc.text('CONTRATO DE PRESTAÇÃO DE SERVIÇOS PUBLICITÁRIOS', margin, y);
    y += 15;
    
    // Body
    doc.setFontSize(12);
    const content = `
Pelo presente instrumento, de um lado, ${profile.nome || 'AGÊNCIA NÃO CADASTRADA'}, inscrita no CPF/CNPJ ${profile.cpf_cnpj || 'N/A'}, com sede em ${profile.endereco || 'N/A'}, ${profile.cidade || 'N/A'} - ${profile.estado || 'N/A'}, doravante denominada CONTRATADA.

E, de outro lado, ${nome || 'NOME DO CLIENTE'}, inscrito(a) no CPF/CNPJ ${cpfCnpj || 'N/A'}, com sede/residência em ${endereco || 'N/A'}, doravante denominado(a) CONTRATANTE.

As partes acima identificadas têm, entre si, justo e acertado o presente Contrato de Prestação de Serviços Publicitários, que se regerá pelas cláusulas seguintes e pelas condições descritas no presente.

Data: ${format(new Date(), 'dd/MM/yyyy')}
    `;
    
    const lines = doc.splitTextToSize(content, 170);
    doc.text(lines, margin, y);
    
    y += (lines.length * 7) + 20;
    
    // Signatures
    doc.line(margin, y, margin + 70, y);
    doc.text('CONTRATADA', margin, y + 5);
    
    doc.line(margin + 90, y, margin + 160, y);
    doc.text('CONTRATANTE', margin + 90, y + 5);

    doc.save('contrato.pdf');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-[#0b462c] tracking-tight flex items-center gap-2">
          <FileText className="w-6 h-6 text-emerald-600" />
          Gerador de Contratos
        </h2>
        <p className="text-xs text-[#8b9aa5] font-medium mt-1">Gere contratos PDF rapidamente com os dados da sua agência.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Form */}
         <div className="bg-white border border-[#e8edf2] rounded-[24px] p-6 h-fit shadow-sm">
            <h3 className="text-[#0b462c] text-xs font-bold uppercase tracking-wider mb-4">Dados do Cliente</h3>
            <div className="space-y-4">
               <div>
                 <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Nome / Razão Social</label>
                 <input type="text" value={nome} onChange={e=>setNome(e.target.value)} className="w-full bg-[#f4f6f8] border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-800 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" />
               </div>
               <div>
                 <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">CPF / CNPJ</label>
                 <input type="text" value={cpfCnpj} onChange={e=>setCpfCnpj(e.target.value)} className="w-full bg-[#f4f6f8] border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-800 text-sm font-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" />
               </div>
               <div>
                 <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Endereço Completo</label>
                 <textarea value={endereco} onChange={e=>setEndereco(e.target.value)} rows={3} className="w-full bg-[#f4f6f8] border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-800 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all resize-none" />
               </div>
               
               <button onClick={generatePDF} className="w-full flex items-center justify-center gap-2 bg-[#0b462c] hover:bg-[#082a1b] text-white rounded-full py-3 text-xs font-bold transition-all shadow-sm">
                 <Download className="w-4 h-4" />
                 Gerar PDF
               </button>
            </div>
         </div>
         
         {/* Preview */}
         <div className="bg-white rounded-[24px] border border-[#e8edf2] p-8 shadow-sm min-h-[600px] text-gray-800 font-serif text-sm">
            <h1 className="text-center font-bold text-lg mb-8 uppercase text-zinc-800">Contrato de Prestação de Serviços Publicitários</h1>
            
            <p className="text-justify mb-4 leading-relaxed">
               Pelo presente instrumento, de um lado, <span className="font-bold">{profile.nome || '________________'}</span>, inscrita no CPF/CNPJ <span className="font-bold">{profile.cpf_cnpj || '________________'}</span>, com sede em <span className="font-bold">{profile.endereco || '________________'}</span>, <span className="font-bold">{profile.cidade || '____'} - {profile.estado || '____'}</span>, doravante denominada CONTRATADA.
            </p>
            
            <p className="text-justify mb-4 leading-relaxed">
               E, de outro lado, <span className="font-bold">{nome || '________________________________'}</span>, inscrito(a) no CPF/CNPJ <span className="font-bold">{cpfCnpj || '________________'}</span>, com sede/residência em <span className="font-bold">{endereco || '________________________________________________'}</span>, doravante denominado(a) CONTRATANTE.
            </p>
            
            <p className="text-justify mb-8 leading-relaxed">
               As partes acima identificadas têm, entre si, justo e acertado o presente Contrato de Prestação de Serviços Publicitários, que se regerá pelas cláusulas seguintes e pelas condições descritas no presente.
            </p>
            
            <div className="mt-16 flex justify-between">
               <div className="w-48 border-t border-gray-800 pt-2 text-center text-xs font-bold">CONTRATADA</div>
               <div className="w-48 border-t border-gray-800 pt-2 text-center text-xs font-bold">CONTRATANTE</div>
            </div>
         </div>
      </div>
    </div>
  );
}
