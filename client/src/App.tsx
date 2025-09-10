import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { MantineSettings } from "src/main/components/settings";
import { DataProvider, GlobalStoreProvider } from "src/main/context/provider";
import { Router } from "src/main/components/routes/routes";

function App() {
  return (
    <>
      <MantineProvider {...MantineSettings}>
        <Notifications />
        <DataProvider>
          <GlobalStoreProvider>
            <Router />
          </GlobalStoreProvider>
        </DataProvider>
      </MantineProvider>
    </>
  );
}

export default App;
