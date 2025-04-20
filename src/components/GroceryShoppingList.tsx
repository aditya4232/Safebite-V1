import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ShoppingCart, Plus, Trash2, Share, Download, 
  Check, ShoppingBag, AlertTriangle, Loader2 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGuestMode } from '@/hooks/useGuestMode';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { app } from '../firebase';
import { trackUserInteraction } from '@/services/mlService';

interface ShoppingListItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
  completed: boolean;
  addedAt: number;
}

interface GroceryShoppingListProps {
  className?: string;
}

const GroceryShoppingList: React.FC<GroceryShoppingListProps> = ({ className = '' }) => {
  const { toast } = useToast();
  const { isGuest } = useGuestMode();
  const [isLoading, setIsLoading] = useState(true);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('General');
  
  // Categories for shopping list items
  const categories = [
    'General', 'Fruits & Vegetables', 'Dairy', 'Bakery', 
    'Snacks', 'Beverages', 'Household', 'Personal Care'
  ];
  
  // Load shopping list from Firebase
  useEffect(() => {
    const loadShoppingList = async () => {
      try {
        const auth = getAuth(app);
        if (!auth.currentUser || isGuest) {
          // For guest users, use local storage
          const storedList = localStorage.getItem('guestShoppingList');
          if (storedList) {
            setShoppingList(JSON.parse(storedList));
          } else {
            // Default items for new users
            setShoppingList([
              {
                id: `default-1-${Date.now()}`,
                name: 'Milk',
                quantity: '1 liter',
                category: 'Dairy',
                completed: false,
                addedAt: Date.now()
              },
              {
                id: `default-2-${Date.now()}`,
                name: 'Bread',
                quantity: '1 loaf',
                category: 'Bakery',
                completed: false,
                addedAt: Date.now()
              }
            ]);
          }
        } else {
          // For logged-in users, use Firebase
          const db = getFirestore(app);
          const userRef = doc(db, 'users', auth.currentUser.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.shoppingList) {
              setShoppingList(userData.shoppingList);
            } else {
              // Default items for new users
              const defaultList = [
                {
                  id: `default-1-${Date.now()}`,
                  name: 'Milk',
                  quantity: '1 liter',
                  category: 'Dairy',
                  completed: false,
                  addedAt: Date.now()
                },
                {
                  id: `default-2-${Date.now()}`,
                  name: 'Bread',
                  quantity: '1 loaf',
                  category: 'Bakery',
                  completed: false,
                  addedAt: Date.now()
                }
              ];
              
              setShoppingList(defaultList);
              
              // Save default list to Firebase
              await setDoc(userRef, { shoppingList: defaultList }, { merge: true });
            }
          }
        }
      } catch (error) {
        console.error('Error loading shopping list:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your shopping list.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadShoppingList();
  }, [isGuest, toast]);
  
  // Save shopping list
  const saveShoppingList = async (newList: ShoppingListItem[]) => {
    try {
      const auth = getAuth(app);
      if (!auth.currentUser || isGuest) {
        // For guest users, use local storage
        localStorage.setItem('guestShoppingList', JSON.stringify(newList));
      } else {
        // For logged-in users, use Firebase
        const db = getFirestore(app);
        const userRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userRef, { shoppingList: newList }, { merge: true });
      }
    } catch (error) {
      console.error('Error saving shopping list:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your shopping list.',
        variant: 'destructive'
      });
    }
  };
  
  // Add new item
  const handleAddItem = () => {
    if (!newItemName.trim()) {
      toast({
        title: 'Item name required',
        description: 'Please enter a name for the item.',
        variant: 'destructive'
      });
      return;
    }
    
    const newItem: ShoppingListItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newItemName.trim(),
      quantity: newItemQuantity.trim() || '1',
      category: newItemCategory,
      completed: false,
      addedAt: Date.now()
    };
    
    const updatedList = [...shoppingList, newItem];
    setShoppingList(updatedList);
    saveShoppingList(updatedList);
    
    // Reset form
    setNewItemName('');
    setNewItemQuantity('');
    
    // Track this interaction
    trackUserInteraction('add_shopping_list_item', {
      isGuest,
      itemName: newItemName,
      itemCategory: newItemCategory
    });
    
    toast({
      title: 'Item added',
      description: `${newItemName} added to your shopping list.`,
      variant: 'default'
    });
  };
  
  // Toggle item completion
  const toggleItemCompletion = (id: string) => {
    const updatedList = shoppingList.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    
    setShoppingList(updatedList);
    saveShoppingList(updatedList);
    
    // Track this interaction
    const item = shoppingList.find(item => item.id === id);
    if (item) {
      trackUserInteraction('toggle_shopping_list_item', {
        isGuest,
        itemName: item.name,
        completed: !item.completed
      });
    }
  };
  
  // Remove item
  const removeItem = (id: string) => {
    const item = shoppingList.find(item => item.id === id);
    const updatedList = shoppingList.filter(item => item.id !== id);
    
    setShoppingList(updatedList);
    saveShoppingList(updatedList);
    
    // Track this interaction
    if (item) {
      trackUserInteraction('remove_shopping_list_item', {
        isGuest,
        itemName: item.name
      });
    }
    
    toast({
      title: 'Item removed',
      description: item ? `${item.name} removed from your shopping list.` : 'Item removed from your shopping list.',
      variant: 'default'
    });
  };
  
  // Clear completed items
  const clearCompletedItems = () => {
    const completedItems = shoppingList.filter(item => item.completed);
    if (completedItems.length === 0) {
      toast({
        title: 'No completed items',
        description: 'There are no completed items to clear.',
        variant: 'default'
      });
      return;
    }
    
    const updatedList = shoppingList.filter(item => !item.completed);
    setShoppingList(updatedList);
    saveShoppingList(updatedList);
    
    // Track this interaction
    trackUserInteraction('clear_completed_shopping_items', {
      isGuest,
      itemCount: completedItems.length
    });
    
    toast({
      title: 'Completed items cleared',
      description: `${completedItems.length} completed items removed from your shopping list.`,
      variant: 'default'
    });
  };
  
  // Download shopping list as text
  const downloadShoppingList = () => {
    try {
      // Group items by category
      const groupedItems: Record<string, ShoppingListItem[]> = {};
      
      shoppingList.forEach(item => {
        if (!groupedItems[item.category]) {
          groupedItems[item.category] = [];
        }
        groupedItems[item.category].push(item);
      });
      
      // Create text content
      let textContent = "SAFEBITE SHOPPING LIST\n";
      textContent += "======================\n\n";
      
      Object.entries(groupedItems).forEach(([category, items]) => {
        textContent += `${category}:\n`;
        items.forEach(item => {
          textContent += `- ${item.name} (${item.quantity})${item.completed ? ' ✓' : ''}\n`;
        });
        textContent += "\n";
      });
      
      // Create download link
      const element = document.createElement('a');
      const file = new Blob([textContent], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `safebite-shopping-list-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      // Track this interaction
      trackUserInteraction('download_shopping_list', {
        isGuest,
        itemCount: shoppingList.length
      });
      
      toast({
        title: 'Shopping list downloaded',
        description: 'Your shopping list has been downloaded as a text file.',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error downloading shopping list:', error);
      toast({
        title: 'Download failed',
        description: 'Failed to download your shopping list.',
        variant: 'destructive'
      });
    }
  };
  
  // Group items by category
  const groupedItems: Record<string, ShoppingListItem[]> = {};
  
  shoppingList.forEach(item => {
    if (!groupedItems[item.category]) {
      groupedItems[item.category] = [];
    }
    groupedItems[item.category].push(item);
  });
  
  // Sort categories alphabetically, but keep "General" at the top
  const sortedCategories = Object.keys(groupedItems).sort((a, b) => {
    if (a === 'General') return -1;
    if (b === 'General') return 1;
    return a.localeCompare(b);
  });
  
  if (isLoading) {
    return (
      <Card className={`sci-fi-card bg-safebite-card-bg/80 backdrop-blur-md border-safebite-teal/20 hover:border-safebite-teal/50 hover:shadow-neon-teal transition-all duration-300 ${className}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-safebite-text flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5 text-safebite-teal" /> Shopping List
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2 flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-safebite-teal" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={`sci-fi-card bg-safebite-card-bg/80 backdrop-blur-md border-safebite-teal/20 hover:border-safebite-teal/50 hover:shadow-neon-teal transition-all duration-300 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-safebite-text flex items-center">
          <ShoppingCart className="mr-2 h-5 w-5 text-safebite-teal" /> Shopping List
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        {/* Add new item form */}
        <div className="space-y-3 mb-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="text"
              placeholder="Add item..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="sci-fi-input flex-1"
            />
            <Input
              type="text"
              placeholder="Quantity"
              value={newItemQuantity}
              onChange={(e) => setNewItemQuantity(e.target.value)}
              className="sci-fi-input w-full sm:w-24"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value)}
              className="sci-fi-input flex-1 h-10 px-3 py-2 bg-safebite-card-bg-alt/50 border border-safebite-card-bg-alt rounded-md text-safebite-text"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <Button
              onClick={handleAddItem}
              className="bg-safebite-teal text-safebite-dark-blue hover:bg-safebite-teal/80"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>
        
        {/* Shopping list */}
        {shoppingList.length > 0 ? (
          <div className="space-y-4">
            <ScrollArea className="h-[300px] pr-4">
              {sortedCategories.map(category => (
                <div key={category} className="mb-4">
                  <h3 className="text-sm font-medium text-safebite-text-secondary mb-2 flex items-center">
                    <Badge variant="outline" className="mr-2">
                      {category}
                    </Badge>
                    <span>{groupedItems[category].length} items</span>
                  </h3>
                  <div className="space-y-2">
                    {groupedItems[category].map(item => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-2 rounded-md ${
                          item.completed 
                            ? 'bg-safebite-card-bg-alt/10 text-safebite-text-secondary' 
                            : 'bg-safebite-card-bg-alt/30 hover:bg-safebite-card-bg-alt/50'
                        } transition-colors`}
                      >
                        <div className="flex items-center">
                          <Checkbox
                            checked={item.completed}
                            onCheckedChange={() => toggleItemCompletion(item.id)}
                            className="mr-2 data-[state=checked]:bg-safebite-teal data-[state=checked]:text-safebite-dark-blue"
                          />
                          <div className={item.completed ? 'line-through' : ''}>
                            <span className="text-sm font-medium">{item.name}</span>
                            {item.quantity && (
                              <span className="text-xs text-safebite-text-secondary ml-2">
                                ({item.quantity})
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="h-8 w-8 text-safebite-text-secondary hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </ScrollArea>
            
            {/* Actions */}
            <div className="flex flex-wrap gap-2 justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={clearCompletedItems}
                className="border-safebite-teal/30 hover:border-safebite-teal/60 text-safebite-text"
              >
                <Check className="h-4 w-4 mr-2" />
                Clear Completed
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadShoppingList}
                className="border-safebite-teal/30 hover:border-safebite-teal/60 text-safebite-text"
              >
                <Download className="h-4 w-4 mr-2" />
                Download List
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <ShoppingBag className="h-10 w-10 mx-auto text-safebite-teal/50 mb-2" />
            <p className="text-safebite-text-secondary mb-4">Your shopping list is empty</p>
            <Button
              variant="outline"
              className="border-safebite-teal/30 hover:border-safebite-teal/60 text-safebite-text"
              onClick={() => {
                setNewItemName('Milk');
                setNewItemQuantity('1 liter');
                setNewItemCategory('Dairy');
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Item
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GroceryShoppingList;
