import { useState, useEffect } from "react";
import {
  Link as LinkIcon,
  Search,
  PlusCircle,
  Eye,
  Link2,
  Timer,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, ShortCodeError } from "@/lib/queryClient";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Url } from "@shared/schema";

import StatCard from "@/components/StatCard";
import LinkItem from "@/components/LinkItem";
import LinkFormModal from "@/components/LinkFormModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import EmptyState from "@/components/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Dashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for modals and selected URL
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<Url | null>(null);

  // State for search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");

  // Fetch user URLs
  const {
    data: urls = [] as Url[],
    isLoading: urlsLoading,
    error: urlsError,
  } = useQuery<Url[]>({
    queryKey: ["/api/urls"],
    staleTime: 10000,
  });

  // Define stats type
  interface Stats {
    totalUrls: number;
    totalClicks: number;
    averageCTR: number;
  }

  // Fetch stats
  const {
    data: stats = { totalUrls: 0, totalClicks: 0, averageCTR: 0 } as Stats,
    isLoading: statsLoading,
  } = useQuery<Stats>({
    queryKey: ["/api/stats"],
    staleTime: 30000,
  });

  // Create URL mutation with custom error handling
  const createUrlMutation = useMutation({
    mutationFn: async (data: any) => {
      // Use fetch directly with manual handling to avoid automatic error throwing
      // We want to check for specific error conditions
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      
      try {
        // Get user ID from Supabase if possible
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user?.id) {
          headers['x-user-id'] = sessionData.session.user.id;
        }
      } catch (error) {
        console.error('Failed to get auth header:', error);
      }
      
      const response = await fetch('/api/urls', {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
        credentials: 'include'
      });
      
      // Check for a specific response
      if (response.status === 400) {
        const errorData = await response.json();
        if (errorData.message === "Short code already in use") {
          // Use our custom error type
          throw new ShortCodeError("This custom path is already taken. Please choose another one.");
        }
        // For other bad request errors
        throw new Error(errorData.message || "Bad request");
      }
      
      // For non-200 responses
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/urls"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "URL shortened successfully",
        description: "Your new short link is ready to use.",
      });
      setShowAddModal(false);
    },
    onError: (error: any) => {
      // Only show toast for errors that aren't our custom short code error
      if (!(error instanceof ShortCodeError)) {
        toast({
          title: "Failed to create short URL",
          description: error.message || "Please try again later.",
          variant: "destructive",
        });
      }
    },
  });

  // Update URL mutation with custom error handling
  const updateUrlMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      // Use fetch directly with manual handling to avoid automatic error throwing
      // We want to check for specific error conditions
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      
      try {
        // Get user ID from Supabase if possible
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user?.id) {
          headers['x-user-id'] = sessionData.session.user.id;
        }
      } catch (error) {
        console.error('Failed to get auth header:', error);
      }
      
      const response = await fetch(`/api/urls/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
        credentials: 'include'
      });
      
      // Check for a specific response
      if (response.status === 400) {
        const errorData = await response.json();
        if (errorData.message === "Short code already in use") {
          // Use our custom error type
          throw new ShortCodeError("This custom path is already taken. Please choose another one.");
        }
        // For other bad request errors
        throw new Error(errorData.message || "Bad request");
      }
      
      // For non-200 responses
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/urls"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "URL updated successfully",
        description: "Your changes have been saved.",
      });
      setShowEditModal(false);
    },
    onError: (error: any) => {
      // Only show toast for errors that aren't our custom short code error
      if (!(error instanceof ShortCodeError)) {
        toast({
          title: "Failed to update URL",
          description: error.message || "Please try again later.",
          variant: "destructive",
        });
      }
    },
  });

  // Delete URL mutation
  const deleteUrlMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/urls/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/urls"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "URL deleted successfully",
        description: "The shortened URL has been removed.",
      });
      setShowDeleteModal(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete URL",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // State to hold form submission errors
  const [formError, setFormError] = useState<string | null>(null);
  
  // Handle form submissions
  const handleAddUrl = (data: any) => {
    // Clear previous errors
    setFormError(null);
    
    createUrlMutation.mutate(data, {
      onSuccess: () => {
        setShowAddModal(false);
        setFormError(null);
      },
      onError: (error: any) => {
        // Keep the modal open
        setShowAddModal(true);
        
        // Set user-friendly error messages
        if (error instanceof ShortCodeError) {
          // This is our custom error for duplicate short codes
          setFormError(`This custom path is already taken. Please choose another one.`);
        } else if (error instanceof Error) {
          const errorMessage = error.message;
          
          if (errorMessage.includes("Short code already in use") ||
              errorMessage.includes("custom path") ||
              errorMessage.includes("already taken")) {
            setFormError(`This custom path is already taken. Please choose another one.`);
          } else if (errorMessage.includes("Bad Request")) {
            setFormError(`There was a problem with your request. Please check your inputs and try again.`);
          } else {
            // Keep original error if we don't have a specific friendly message
            setFormError(errorMessage);
          }
        } else {
          setFormError('Failed to create short URL. Please try again.');
        }
      }
    });
  };

  const handleEditUrl = (data: any) => {
    if (!currentUrl) return;
    
    // Clear previous errors
    setFormError(null);
    
    updateUrlMutation.mutate({ id: currentUrl.id, data }, {
      onSuccess: () => {
        setShowEditModal(false);
        setFormError(null);
      },
      onError: (error: any) => {
        // Keep the modal open
        setShowEditModal(true);
        
        // Set user-friendly error messages
        if (error instanceof ShortCodeError) {
          // This is our custom error for duplicate short codes
          setFormError(`This custom path is already taken. Please choose another one.`);
        } else if (error instanceof Error) {
          const errorMessage = error.message;
          
          if (errorMessage.includes("Short code already in use") ||
              errorMessage.includes("custom path") ||
              errorMessage.includes("already taken")) {
            setFormError(`This custom path is already taken. Please choose another one.`);
          } else if (errorMessage.includes("Bad Request")) {
            setFormError(`There was a problem with your request. Please check your inputs and try again.`);
          } else {
            // Keep original error if we don't have a specific friendly message
            setFormError(errorMessage);
          }
        } else {
          setFormError('Failed to update URL. Please try again.');
        }
      }
    });
  };

  const handleDeleteUrl = () => {
    if (!currentUrl) return;
    deleteUrlMutation.mutate(currentUrl.id);
  };

  // Open edit modal with URL data
  const openEditModal = (url: Url) => {
    setCurrentUrl(url);
    setShowEditModal(true);
  };

  // Open delete confirmation modal
  const openDeleteModal = (url: Url) => {
    setCurrentUrl(url);
    setShowDeleteModal(true);
  };

  // Filter and sort URLs based on search term, status, and sort option
  const filteredAndSortedUrls = urls
    .filter((url: Url) => {
      // Apply search filter
      const matchesSearch =
        searchTerm === "" ||
        url.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
        url.shortCode.toLowerCase().includes(searchTerm.toLowerCase());

      // Apply status filter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && url.isActive) ||
        (statusFilter === "inactive" && !url.isActive);

      return matchesSearch && matchesStatus;
    })
    .sort((a: Url, b: Url) => {
      switch (sortOption) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "most-clicked":
          return b.clicks - a.clicks;
        case "least-clicked":
          return a.clicks - b.clicks;
        default:
          return 0;
      }
    });

  // Handle 404 errors differently than other errors
  useEffect(() => {
    // User found error messages shouldn't trigger toast alerts
    if (
      urlsError &&
      typeof urlsError === "object" &&
      "message" in urlsError &&
      urlsError.message !== "User not found"
    ) {
      toast({
        title: "Failed to load URLs",
        description: "Please refresh the page and try again.",
        variant: "destructive",
      });
    }
  }, [urlsError, toast]);

  return (
    <>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:flex sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Your Links</h1>
          <div className="mt-3 sm:mt-0">
            <Button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              Add New Link
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <StatCard
            icon={<LinkIcon className="h-6 w-6 text-primary" />}
            title="Total Links"
            value={statsLoading ? "..." : stats.totalUrls}
            bg="bg-blue-100"
          />
          <StatCard
            icon={<Eye className="h-6 w-6 text-secondary" />}
            title="Total Clicks"
            value={statsLoading ? "..." : stats.totalClicks}
            bg="bg-green-100"
            change={
              stats.totalClicks > 0
                ? { value: "12%", positive: true }
                : undefined
            }
          />
          <StatCard
            icon={<Timer className="h-6 w-6 text-accent" />}
            title="Average CTR"
            value={
              statsLoading ? "..." : `${Number(stats.averageCTR).toFixed(1)}`
            }
            bg="bg-indigo-100"
          />
        </div>

        {/* Search and filter */}
        <div className="mt-6 flex flex-col md:flex-row justify-between">
          <div className="mb-4 md:mb-0 w-full md:w-1/3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search links"
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Links</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Sort by: Newest</SelectItem>
                <SelectItem value="oldest">Sort by: Oldest</SelectItem>
                <SelectItem value="most-clicked">
                  Sort by: Most Clicked
                </SelectItem>
                <SelectItem value="least-clicked">
                  Sort by: Least Clicked
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Links list */}
        {urlsLoading ? (
          <div className="mt-6 shadow rounded-md p-6 text-center">
            <div className="animate-pulse flex justify-center">
              <LinkIcon className="h-10 w-10 text-gray-200" />
            </div>
            <p className="mt-4 text-gray-500">Loading your links...</p>
          </div>
        ) : urls.length === 0 ? (
          <EmptyState onAddNew={() => setShowAddModal(true)} />
        ) : (
          <div className="mt-6 overflow-hidden">
            <ul className="space-y-4 shadow sm:rounded-md rounded-lg">
              {filteredAndSortedUrls.map((url: Url) => (
                <LinkItem
                  key={url.id}
                  url={url}
                  onEdit={openEditModal}
                  onDelete={openDeleteModal}
                />
              ))}
            </ul>

            {/* Only show certain error messages */}
            {urlsError &&
              filteredAndSortedUrls.length === 0 &&
              typeof urlsError === "object" &&
              "message" in urlsError &&
              urlsError.message !== "User not found" && (
                <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Failed to load URLs
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>Please refresh the page and try again.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
          </div>
        )}
      </div>

      {/* Modals */}
      <LinkFormModal
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setFormError(null);
        }}
        onSubmit={handleAddUrl}
        isEditing={false}
        serverError={formError}
      />

      <LinkFormModal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setFormError(null);
        }}
        onSubmit={handleEditUrl}
        initialData={currentUrl}
        isEditing={true}
        serverError={formError}
      />

      <DeleteConfirmModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteUrl}
        url={currentUrl}
      />
    </>
  );
}
