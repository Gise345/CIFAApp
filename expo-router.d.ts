declare module 'expo-router' {
    export const useRouter: () => {
      back: () => void;
      push: (href: string) => void;
      replace: (href: string) => void;
      navigate: (href: string) => void;
    };
    
    export const router: {
      back: () => void;
      push: (href: string) => void;
      replace: (href: string) => void;
      navigate: (href: string) => void;
    };

  export function useSegments(): Record<string, string | string[]> {
    throw new Error('Function not implemented.');
  }
  }