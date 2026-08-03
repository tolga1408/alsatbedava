import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import CreateListing from "./pages/CreateListing";
import ListingDetail from "./pages/ListingDetail";
import Browse from "./pages/Browse";
import MyListings from "./pages/MyListings";
import Messages from "./pages/Messages";
import SavedSearches from "./pages/SavedSearches";
import Admin from "./pages/Admin";
import Login from "./pages/Login";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/browse" component={Browse} />
      <Route path="/create-listing" component={CreateListing} />
      <Route path="/listing/:id" component={ListingDetail} />
      <Route path="/my-listings" component={MyListings} />
      <Route path="/messages" component={Messages} />
      <Route path="/saved-searches" component={SavedSearches} />
      <Route path="/admin" component={Admin} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
