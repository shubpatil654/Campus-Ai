const { supabase } = require('../config/database');

class CollegeService {
  // Get all colleges with optional filtering
  async getAllColleges(filters = {}) {
    try {
      let query = supabase
        .from('colleges')
        .select(`
          *,
          courses (*)
        `)
        .eq('is_active', true);

      // Apply filters
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters.stream) {
        query = query.contains('courses', [{ stream: filters.stream }]);
      }

      if (filters.minRating) {
        query = query.gte('rating', filters.minRating);
      }

      if (filters.collegeType) {
        query = query.eq('college_type', filters.collegeType);
      }

      if (filters.accreditation) {
        query = query.contains('accreditation', [filters.accreditation]);
      }

      if (filters.facilities) {
        query = query.contains('facilities', [filters.facilities]);
      }

      // Apply sorting
      const sortBy = filters.sortBy || 'rating';
      const sortOrder = filters.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching colleges:', error);
        throw new Error('Failed to fetch colleges');
      }

      return data;
    } catch (error) {
      console.error('CollegeService.getAllColleges error:', error);
      throw error;
    }
  }

  // Get single college by ID
  async getCollegeById(id) {
    try {
      const { data, error } = await supabase
        .from('colleges')
        .select(`
          *,
          courses (*),
          hostels (*),
          scholarships (*),
          college_reviews (
            *,
            users (name, avatar_url)
          )
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching college:', error);
        throw new Error('College not found');
      }

      return data;
    } catch (error) {
      console.error('CollegeService.getCollegeById error:', error);
      throw error;
    }
  }

  // Search colleges
  async searchColleges(searchTerm) {
    try {
      const { data, error } = await supabase
        .from('colleges')
        .select(`
          *,
          courses (*)
        `)
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`)
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (error) {
        console.error('Error searching colleges:', error);
        throw new Error('Failed to search colleges');
      }

      return data;
    } catch (error) {
      console.error('CollegeService.searchColleges error:', error);
      throw error;
    }
  }

  // Get colleges by stream
  async getCollegesByStream(stream) {
    try {
      const { data, error } = await supabase
        .from('colleges')
        .select(`
          *,
          courses!inner (*)
        `)
        .eq('courses.stream', stream)
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (error) {
        console.error('Error fetching colleges by stream:', error);
        throw new Error('Failed to fetch colleges by stream');
      }

      return data;
    } catch (error) {
      console.error('CollegeService.getCollegesByStream error:', error);
      throw error;
    }
  }

  // Get top rated colleges
  async getTopRatedColleges(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('colleges')
        .select('*')
        .eq('is_active', true)
        .gte('rating', 4.0)
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching top rated colleges:', error);
        throw new Error('Failed to fetch top rated colleges');
      }

      return data;
    } catch (error) {
      console.error('CollegeService.getTopRatedColleges error:', error);
      throw error;
    }
  }

  // Add college to user favorites
  async addToFavorites(userId, collegeId) {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .insert([
          { user_id: userId, college_id: collegeId }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error adding to favorites:', error);
        throw new Error('Failed to add to favorites');
      }

      return data;
    } catch (error) {
      console.error('CollegeService.addToFavorites error:', error);
      throw error;
    }
  }

  // Remove college from user favorites
  async removeFromFavorites(userId, collegeId) {
    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('college_id', collegeId);

      if (error) {
        console.error('Error removing from favorites:', error);
        throw new Error('Failed to remove from favorites');
      }

      return { success: true };
    } catch (error) {
      console.error('CollegeService.removeFromFavorites error:', error);
      throw error;
    }
  }

  // Get user favorites
  async getUserFavorites(userId) {
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          *,
          colleges (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user favorites:', error);
        throw new Error('Failed to fetch user favorites');
      }

      return data;
    } catch (error) {
      console.error('CollegeService.getUserFavorites error:', error);
      throw error;
    }
  }

  // Add college review
  async addReview(userId, collegeId, rating, reviewText) {
    try {
      const { data, error } = await supabase
        .from('college_reviews')
        .insert([
          {
            user_id: userId,
            college_id: collegeId,
            rating,
            review_text: reviewText
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error adding review:', error);
        throw new Error('Failed to add review');
      }

      // Update college rating
      await this.updateCollegeRating(collegeId);

      return data;
    } catch (error) {
      console.error('CollegeService.addReview error:', error);
      throw error;
    }
  }

  // Update college rating based on reviews
  async updateCollegeRating(collegeId) {
    try {
      const { data: reviews, error: reviewsError } = await supabase
        .from('college_reviews')
        .select('rating')
        .eq('college_id', collegeId);

      if (reviewsError) {
        console.error('Error fetching reviews for rating update:', reviewsError);
        return;
      }

      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;

        const { error: updateError } = await supabase
          .from('colleges')
          .update({
            rating: Math.round(averageRating * 100) / 100,
            total_ratings: reviews.length
          })
          .eq('id', collegeId);

        if (updateError) {
          console.error('Error updating college rating:', updateError);
        }
      }
    } catch (error) {
      console.error('CollegeService.updateCollegeRating error:', error);
    }
  }
}

module.exports = new CollegeService();
