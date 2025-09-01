import toast from 'react-hot-toast';

export const showSuccess = (message: string) => {
  toast.success(message, {
    style: {
      border: '1px solid #00A04A',
      padding: '16px',
      color: '#00A04A',
      background: '#F0FAF5'
    },
    iconTheme: {
      primary: '#00A04A',
      secondary: '#FFFAEE',
    },
  });
};

export const showError = (message: string) => {
  toast.error(message, {
    style: {
      border: '1px solid #E53E3E',
      padding: '16px',
      color: '#E53E3E',
      background: '#FDF2F2'
    },
  });
};

// Utilisation dans les composants:
// import { showSuccess, showError } from '@/lib/toast';
// showSuccess('Opération réussie !');