import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AccessibilityToolbar } from "@/components/ui/accessibility-toolbar";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home-full";
import Accessibility from "@/pages/accessibility";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import BlogList from "@/pages/blog-list";
import BlogPost from "@/pages/blog-post";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home}/>
      <Route path="/blog" component={BlogList}/>
      <Route path="/blog/:id" component={BlogPost}/>
      <Route path="/accessibility" component={Accessibility}/>
      <Route path="/privacy" component={Privacy}/>
      <Route path="/terms" component={Terms}/>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AccessibilityToolbar />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
