package org.habemusrex;

import org.habemusrex.cachedData.GameSessionData;
import org.habemusrex.cachedData.StaticDataCache;
import org.habemusrex.ui.GameApp;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;

public class Main {

    public static void main(String[] args) {
        Configuration configuration = new Configuration();
        configuration.configure("hibernate.cfg.xml");

        try (SessionFactory sessionFactory = configuration.buildSessionFactory(); Session session = sessionFactory.openSession()) {
            GameSessionData sessionData = new GameSessionData();

            StaticDataCache.loadStaticData(session); // static data
            sessionData.loadData(session); // dynamic data

            GameApp.setSessionData(sessionData);

            GameApp.main(args);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
