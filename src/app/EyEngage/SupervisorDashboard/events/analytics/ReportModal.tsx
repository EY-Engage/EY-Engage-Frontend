import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

interface ReportModalProps {
  report: string;
  onClose: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ report, onClose }) => {
  const reportRef = useRef<HTMLDivElement>(null);

  // Fonction pour générer et télécharger le PDF
  const handleGeneratePDF = async () => {
    if (!reportRef.current || !report) {
      console.error("Contenu du rapport non disponible");
      return;
    }

    try {
      // Créer le contenu HTML complet pour le PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>EY Engage - Rapport Analytique des Événements</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #130047;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #130047;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .ey-logo {
              font-size: 24px;
              font-weight: bold;
              color: #130047;
              margin-bottom: 10px;
            }
            .report-title {
              font-size: 20px;
              color: #130047;
              margin: 0;
            }
            .report-date {
              font-size: 12px;
              color: #666;
              margin-top: 5px;
            }
            .content {
              max-width: 800px;
              margin: 0 auto;
            }
            h1, h2, h3 {
              color: #130047;
              margin-top: 25px;
              margin-bottom: 15px;
            }
            h1 { font-size: 18px; }
            h2 { font-size: 16px; }
            h3 { font-size: 14px; }
            p {
              margin-bottom: 12px;
              text-align: justify;
            }
            .stat-value {
              font-weight: bold;
              color: #130047;
              font-size: 1.1em;
            }
            .highlight {
              background-color: #FFE600;
              padding: 2px 4px;
              border-radius: 3px;
            }
            strong {
              color: #130047;
              font-weight: bold;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ccc;
              text-align: center;
              font-size: 10px;
              color: #666;
            }
            @page {
              margin: 2cm;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="ey-logo">EY Engage</div>
            <h1 class="report-title">Rapport Analytique des Événements</h1>
            <div class="report-date">Généré le ${new Date().toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</div>
          </div>
          
          <div class="content">
            ${renderHtmlReport()}
          </div>
          
          <div class="footer">
            <p>Ce rapport a été généré automatiquement par EY Engage</p>
            <p>© ${new Date().getFullYear()} EY. Tous droits réservés.</p>
          </div>
        </body>
        </html>
      `;

      // Créer un blob avec le contenu HTML
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);

      // Créer un lien de téléchargement
      const link = document.createElement('a');
      link.href = url;
      link.download = `EY_Engage_Rapport_Evenements_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Nettoyer l'URL
      URL.revokeObjectURL(url);

      // Alternative : Ouvrir dans une nouvelle fenêtre pour impression
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Attendre que le contenu soit chargé puis imprimer
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
          }, 100);
        };
      }

    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Une erreur s\'est produite lors de la génération du PDF. Veuillez réessayer.');
    }
  };

  // Fonction pour nettoyer et formater le rapport HTML
  const renderHtmlReport = () => {
    if (!report) return '';
    
    return report
      // Supprimer les marqueurs markdown
      .replace(/```markdown\n?/g, '')
      .replace(/```/g, '')
      
      // Convertir le gras markdown en HTML
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      
      // Convertir les titres markdown
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      
      // Convertir les listes
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
      
      // Convertir les retours à la ligne
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br/>')
      
      // Entourer le contenu dans des paragraphes
      .replace(/^(.)/gm, '<p>$1')
      .replace(/$(.)/gm, '$1</p>')
      
      // Nettoyer les balises p vides ou malformées
      .replace(/<p><\/p>/g, '')
      .replace(/<p>(<h[1-6])/g, '$1')
      .replace(/(<\/h[1-6]>)<\/p>/g, '$1')
      .replace(/<p>(<ul>)/g, '$1')
      .replace(/(<\/ul>)<\/p>/g, '$1');
  };

  return (
    <Dialog open={!!report} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-ey-primary text-xl">
            📊 Rapport Analytique des Événements
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div 
            ref={reportRef} 
            className="p-6 bg-white text-black border rounded-lg"
            style={{
              fontFamily: 'Arial, sans-serif',
              lineHeight: '1.6',
              color: '#130047'
            }}
          >
            <div className="mb-4 pb-4 border-b-2 border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-ey-primary mb-2">
                  EY Engage
                </div>
                <h2 className="text-lg font-semibold text-ey-primary">
                  Rapport Analytique des Événements
                </h2>
                <p className="text-sm text-gray-600 mt-2">
                  Généré le {new Date().toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            
            <div
              className="prose max-w-none"
              style={{ color: '#130047' }}
              dangerouslySetInnerHTML={{ __html: renderHtmlReport() }}
            />
            
            <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
              <p>Ce rapport a été généré automatiquement par EY Engage</p>
              <p>© {new Date().getFullYear()} EY. Tous droits réservés.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-4 pt-4 border-t">
          <Button
            onClick={handleGeneratePDF}
            className="bg-ey-primary hover:bg-ey-yellow text-ey-black px-6 py-2"
          >
            📄 Générer PDF
          </Button>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="px-6 py-2"
          >
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportModal;