import { createContext, useContext } from 'react';
import { getModule, setModule } from 'src/logic';

const moduleContext = createContext(null);

export const BearProvider = ({ children, ...props }) => {
  const storeRef = useRef();
  if (!storeRef.current) {
    storeRef.current = createBearStore(props);
  }
  return (
    <BearContext.Provider value={storeRef.current}>
      {children}
    </BearContext.Provider>
  );
};
