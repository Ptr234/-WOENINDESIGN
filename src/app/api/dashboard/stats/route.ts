import { NextRequest, NextResponse } from 'next/server';
import AuthService from '@/lib/auth';
import { query } from '@/lib/database/connection';
import { APIResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const user = await AuthService.authenticateRequest(request);
    
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        } as APIResponse,
        { status: 401 }
      );
    }

    let dashboardStats: any = {};

    if (user.role === 'admin') {
      // Admin dashboard stats
      const adminStatsQuery = `
        SELECT 
          (SELECT COUNT(*) FROM users) as total_users,
          (SELECT COUNT(*) FROM users WHERE role = 'designer') as total_designers,
          (SELECT COUNT(*) FROM users WHERE role = 'client') as total_clients,
          (SELECT COUNT(*) FROM users WHERE role = 'supplier') as total_suppliers,
          (SELECT COUNT(*) FROM hiring_requests) as total_projects,
          (SELECT COUNT(*) FROM hiring_requests WHERE status = 'in_progress') as active_projects,
          (SELECT COUNT(*) FROM hiring_requests WHERE status = 'completed') as completed_projects,
          (SELECT COUNT(*) FROM portfolio_items) as total_portfolio_items,
          (SELECT COUNT(*) FROM products) as total_products,
          (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '30 days') as new_users_this_month,
          (SELECT COUNT(*) FROM hiring_requests WHERE created_at > NOW() - INTERVAL '30 days') as new_projects_this_month,
          (SELECT COALESCE(AVG(rating), 0) FROM reviews) as average_rating
      `;
      
      const result = await query(adminStatsQuery);
      const stats = result.rows[0];
      
      dashboardStats = {
        totalUsers: parseInt(stats.total_users) || 0,
        totalDesigners: parseInt(stats.total_designers) || 0,
        totalClients: parseInt(stats.total_clients) || 0,
        totalSuppliers: parseInt(stats.total_suppliers) || 0,
        totalProjects: parseInt(stats.total_projects) || 0,
        activeProjects: parseInt(stats.active_projects) || 0,
        completedProjects: parseInt(stats.completed_projects) || 0,
        totalPortfolioItems: parseInt(stats.total_portfolio_items) || 0,
        totalProducts: parseInt(stats.total_products) || 0,
        newUsersThisMonth: parseInt(stats.new_users_this_month) || 0,
        newProjectsThisMonth: parseInt(stats.new_projects_this_month) || 0,
        averageRating: parseFloat(stats.average_rating) || 0,
      };

    } else if (user.role === 'designer') {
      // Designer dashboard stats
      const designerStatsQuery = `
        SELECT 
          COUNT(hr.id) as total_projects,
          COUNT(CASE WHEN hr.status = 'in_progress' THEN 1 END) as active_projects,
          COUNT(CASE WHEN hr.status = 'completed' THEN 1 END) as completed_projects,
          COALESCE(SUM(CASE WHEN hr.status = 'completed' THEN hr.budget END), 0) as total_earnings,
          COALESCE(SUM(CASE WHEN hr.status = 'completed' AND hr.created_at > NOW() - INTERVAL '30 days' THEN hr.budget END), 0) as monthly_earnings,
          COUNT(DISTINCT pi.id) as portfolio_items,
          COALESCE(dp.average_rating, 0) as client_rating,
          COUNT(DISTINCT r.id) as total_reviews,
          COUNT(CASE WHEN hr.created_at > NOW() - INTERVAL '7 days' THEN 1 END) as recent_projects
        FROM designer_profiles dp
        LEFT JOIN hiring_requests hr ON dp.id = hr.designer_id
        LEFT JOIN portfolio_items pi ON dp.id = pi.designer_id
        LEFT JOIN reviews r ON dp.id = r.designer_id
        WHERE dp.id = $1
        GROUP BY dp.id, dp.average_rating
      `;
      
      const result = await query(designerStatsQuery, [user.id]);
      const stats = result.rows[0] || {};
      
      dashboardStats = {
        totalProjects: parseInt(stats.total_projects) || 0,
        activeProjects: parseInt(stats.active_projects) || 0,
        completedProjects: parseInt(stats.completed_projects) || 0,
        totalEarnings: parseFloat(stats.total_earnings) || 0,
        monthlyEarnings: parseFloat(stats.monthly_earnings) || 0,
        portfolioItems: parseInt(stats.portfolio_items) || 0,
        clientRating: parseFloat(stats.client_rating) || 0,
        totalReviews: parseInt(stats.total_reviews) || 0,
        recentProjects: parseInt(stats.recent_projects) || 0,
      };

    } else if (user.role === 'supplier') {
      // Supplier dashboard stats
      const supplierStatsQuery = `
        SELECT 
          COUNT(DISTINCT p.id) as total_products,
          COUNT(CASE WHEN p.in_stock = true THEN 1 END) as products_in_stock,
          COUNT(CASE WHEN p.in_stock = false THEN 1 END) as products_out_of_stock,
          COUNT(CASE WHEN p.created_at > NOW() - INTERVAL '30 days' THEN 1 END) as new_products_this_month,
          0 as total_orders,
          0 as active_orders,
          0 as monthly_revenue,
          0 as new_inquiries
        FROM supplier_profiles sp
        LEFT JOIN products p ON sp.id = p.supplier_id
        WHERE sp.id = $1
        GROUP BY sp.id
      `;
      
      const result = await query(supplierStatsQuery, [user.id]);
      const stats = result.rows[0] || {};
      
      dashboardStats = {
        totalProducts: parseInt(stats.total_products) || 0,
        productsInStock: parseInt(stats.products_in_stock) || 0,
        productsOutOfStock: parseInt(stats.products_out_of_stock) || 0,
        newProductsThisMonth: parseInt(stats.new_products_this_month) || 0,
        totalOrders: parseInt(stats.total_orders) || 0,
        activeOrders: parseInt(stats.active_orders) || 0,
        monthlyRevenue: parseFloat(stats.monthly_revenue) || 0,
        newInquiries: parseInt(stats.new_inquiries) || 0,
      };

    } else if (user.role === 'client') {
      // Client dashboard stats
      const clientStatsQuery = `
        SELECT 
          COUNT(hr.id) as total_projects,
          COUNT(CASE WHEN hr.status = 'in_progress' THEN 1 END) as active_projects,
          COUNT(CASE WHEN hr.status = 'completed' THEN 1 END) as completed_projects,
          COALESCE(SUM(hr.budget), 0) as total_spent,
          COALESCE(SUM(CASE WHEN hr.created_at > NOW() - INTERVAL '30 days' THEN hr.budget END), 0) as monthly_spent,
          COUNT(DISTINCT hr.designer_id) as designers_worked_with,
          COUNT(CASE WHEN hr.created_at > NOW() - INTERVAL '7 days' THEN 1 END) as recent_projects,
          COALESCE(AVG(r.rating), 0) as average_project_rating
        FROM hiring_requests hr
        LEFT JOIN reviews r ON hr.id::text = r.project_id
        WHERE hr.client_id = $1
        GROUP BY hr.client_id
      `;
      
      const result = await query(clientStatsQuery, [user.id]);
      const stats = result.rows[0] || {};
      
      dashboardStats = {
        totalProjects: parseInt(stats.total_projects) || 0,
        activeProjects: parseInt(stats.active_projects) || 0,
        completedProjects: parseInt(stats.completed_projects) || 0,
        totalSpent: parseFloat(stats.total_spent) || 0,
        monthlySpent: parseFloat(stats.monthly_spent) || 0,
        designersWorkedWith: parseInt(stats.designers_worked_with) || 0,
        recentProjects: parseInt(stats.recent_projects) || 0,
        averageProjectRating: parseFloat(stats.average_project_rating) || 0,
      };
    }

    return NextResponse.json(
      {
        success: true,
        data: dashboardStats,
      } as APIResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      } as APIResponse,
      { status: 500 }
    );
  }
}