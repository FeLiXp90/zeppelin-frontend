import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'Dashboard',
      component: () => import('../views/Dashboard.vue'),
      meta: {
        title: 'Dashboard',
      },
    },
    /*{
      path: '/calendar',
      name: 'Calendar',
      component: () => import('../views/Others/Calendar.vue'),
      meta: {
        title: 'Calendar',
      },
    },
    {
      path: '/form-elements',
      name: 'Form Elements',
      component: () => import('../views/Forms/FormElements.vue'),
      meta: {
        title: 'Form Elements',
      },
    },
    {
      path: '/basic-tables',
      name: 'Basic Tables',
      component: () => import('../views/Tables/BasicTables.vue'),
      meta: {
        title: 'Basic Tables',
      },
    },
    {
      path: '/line-chart',
      name: 'Line Chart',
      component: () => import('../views/Chart/LineChart/LineChart.vue'),
    },
    {
      path: '/bar-chart',
      name: 'Bar Chart',
      component: () => import('../views/Chart/BarChart/BarChart.vue'),
    },
    {
      path: '/alerts',
      name: 'Alerts',
      component: () => import('../views/UiElements/Alerts.vue'),
      meta: {
        title: 'Alerts',
      },
    },
    {
      path: '/avatars',
      name: 'Avatars',
      component: () => import('../views/UiElements/Avatars.vue'),
      meta: {
        title: 'Avatars',
      },
    },
    {
      path: '/badge',
      name: 'Badge',
      component: () => import('../views/UiElements/Badges.vue'),
      meta: {
        title: 'Badge',
      },
    },

    {
      path: '/buttons',
      name: 'Buttons',
      component: () => import('../views/UiElements/Buttons.vue'),
      meta: {
        title: 'Buttons',
      },
    },

    {
      path: '/images',
      name: 'Images',
      component: () => import('../views/UiElements/Images.vue'),
      meta: {
        title: 'Images',
      },
    },
    {
      path: '/videos',
      name: 'Videos',
      component: () => import('../views/UiElements/Videos.vue'),
      meta: {
        title: 'Videos',
      },
    },
    */
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/Others/UserProfile.vue'),
      meta: {
        title: 'Profile',
      },
    },
    {
      path: '/continuous-integration',
      name: 'Continuous Integration',
      component: () => import('../views/Forms/ContinuousIntegration.vue'),
      meta: {
        title: 'Continuous Integration',
      },
    },
    {
      path: '/continuous-deployment',
      name: 'Continuous Deployment',
      component: () => import('../views/Forms/ContinuousDeployment.vue'),
      meta: {
        title: 'Continuous Deployment',
      },
    },
        {
      path: '/agile-organization',
      name: 'Agile Organization',
      component: () => import('../views/Forms/AgileOrganization.vue'),
      meta: {
        title: 'Agile Organization',
      },
    },
    {
      path: '/innovation-system',
      name: 'R&D as Innovation System',
      component: () => import('../views/Forms/InnovationSystem.vue'),
      meta: {
        title: 'R&D as Innovation System',
      },
    },
    
    {
      path: '/blank',
      name: 'Blank',
      component: () => import('../views/Pages/BlankPage.vue'),
      meta: {
        title: 'Blank',
      },
    },

    {
      path: '/error-404',
      name: '404 Error',
      component: () => import('../views/Errors/FourZeroFour.vue'),
      meta: {
        title: '404 Error',
      },
    },

    {
      path: '/signin',
      name: 'Signin',
      component: () => import('../views/Auth/Signin.vue'),
      meta: {
        title: 'Signin',
      },
    },
    {
      path: '/signup',
      name: 'Signup',
      component: () => import('../views/Auth/Signup.vue'),
      meta: {
        title: 'Signup',
      },
    },
    {
      path: '/password-reset',
      name: 'PasswordReset',
      component: () => import('../views/Auth/PasswordReset.vue'),
      meta: {
        title: 'PasswordReset',
      },
    },
    {
      path: '/reset-password',
      name: 'ResetPassword',
      component: () => import('../views/Auth/ResetPassword.vue'),
      meta: {
        title: 'ResetPassword',
      },
    },
  ],
})

export default router

router.beforeEach((to, from, next) => {
  
  const auth = useAuthStore()
  const publicPages = ['/signin', '/signup', '/password-reset', '/reset-password',]
  const authRequired = !publicPages.includes(to.path)

  if (authRequired && !auth.isAuthenticated) {
    return next('/signin')
  }

  if (!authRequired && auth.isAuthenticated) {
      return next(from.fullPath || '/')
  }
  
  document.title = `${to.meta.title} | Zeppelin Solution`
  next()
  
})