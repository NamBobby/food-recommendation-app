import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
  SafeAreaView
} from 'react-native';
import Slider from '@react-native-community/slider';
import { apiClient } from '../../services/api';
import styles from '../../styles/systemSettingsStyle';

interface SystemConfig {
  recommendation_algorithm: {
    emotion_weight: number;
    user_preference_weight: number;
    min_rating_threshold: number;
  };
  notification_settings: {
    new_users_notification: boolean;
    low_rating_alert: boolean;
    daily_report: boolean;
  };
  data_retention: {
    log_retention_days: number;
    user_inactivity_threshold_days: number;
  };
}

const SystemSettings: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [config, setConfig] = useState<SystemConfig>({
    recommendation_algorithm: {
      emotion_weight: 0.7,
      user_preference_weight: 0.3,
      min_rating_threshold: 3.5
    },
    notification_settings: {
      new_users_notification: true,
      low_rating_alert: true,
      daily_report: false
    },
    data_retention: {
      log_retention_days: 365,
      user_inactivity_threshold_days: 90
    }
  });
  const [originalConfig, setOriginalConfig] = useState<SystemConfig | null>(null);

  useEffect(() => {
    fetchSystemConfig();
  }, []);

  const fetchSystemConfig = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/api/admin/system-config');
      
      if (response.data && response.data.status === 'success') {
        setConfig(response.data.config);
        setOriginalConfig(response.data.config);
      }
    } catch (error) {
      console.error('Error fetching system config:', error);
      setError('Failed to load system configuration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      await apiClient.put('/api/admin/system-config', config);
      
      setSuccessMessage('System configuration saved successfully!');
      setOriginalConfig({...config});
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Error saving system config:', error);
      setError('Failed to save system configuration. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetConfig = () => {
    if (originalConfig) {
      Alert.alert(
        'Reset Configuration',
        'Are you sure you want to reset all settings to their original values?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Reset', 
            onPress: () => {
              setConfig({...originalConfig});
              setSuccessMessage('Settings reset to original values.');
              
              // Clear success message after 3 seconds
              setTimeout(() => {
                setSuccessMessage(null);
              }, 3000);
            } 
          }
        ]
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6EA9F7" />
        <Text style={styles.loadingText}>Loading system configuration...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>System Settings</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Recommendation Algorithm Settings */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Recommendation Algorithm</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Emotion Weight</Text>
            <Text style={styles.settingDescription}>
              How much emphasis to place on the user's current emotion when making recommendations.
              Higher values prioritize emotional context over user history.
            </Text>
            <View style={styles.sliderContainer}>
              <View style={styles.sliderLabel}>
                <Text>Low Influence</Text>
                <Text style={styles.sliderValue}>{config.recommendation_algorithm.emotion_weight.toFixed(2)}</Text>
                <Text>High Influence</Text>
              </View>
              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={0}
                maximumValue={1}
                step={0.05}
                value={config.recommendation_algorithm.emotion_weight}
                onValueChange={(value) => setConfig({
                  ...config,
                  recommendation_algorithm: {
                    ...config.recommendation_algorithm,
                    emotion_weight: value,
                    // Update user_preference_weight to maintain total of 1.0
                    user_preference_weight: parseFloat((1 - value).toFixed(2))
                  }
                })}
                minimumTrackTintColor="#6EA9F7"
                maximumTrackTintColor="#D1D5DB"
                thumbTintColor="#6EA9F7"
              />
            </View>
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>User Preference Weight</Text>
            <Text style={styles.settingDescription}>
              How much emphasis to place on the user's previous preferences when making recommendations.
              This is automatically adjusted based on the Emotion Weight to maintain a total of 1.0.
            </Text>
            <View style={styles.sliderContainer}>
              <View style={styles.sliderLabel}>
                <Text>Low Influence</Text>
                <Text style={styles.sliderValue}>{config.recommendation_algorithm.user_preference_weight.toFixed(2)}</Text>
                <Text>High Influence</Text>
              </View>
              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={0}
                maximumValue={1}
                step={0.05}
                value={config.recommendation_algorithm.user_preference_weight}
                onValueChange={(value) => setConfig({
                  ...config,
                  recommendation_algorithm: {
                    ...config.recommendation_algorithm,
                    user_preference_weight: value,
                    // Update emotion_weight to maintain total of 1.0
                    emotion_weight: parseFloat((1 - value).toFixed(2))
                  }
                })}
                minimumTrackTintColor="#6EA9F7"
                maximumTrackTintColor="#D1D5DB"
                thumbTintColor="#6EA9F7"
              />
            </View>
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Minimum Rating Threshold</Text>
            <Text style={styles.settingDescription}>
              Minimum average rating required for a food to be recommended. 
              Higher values ensure only the most highly-rated foods are recommended.
            </Text>
            <View style={styles.sliderContainer}>
              <View style={styles.sliderLabel}>
                <Text>Low (1.0)</Text>
                <Text style={styles.sliderValue}>{config.recommendation_algorithm.min_rating_threshold.toFixed(1)}</Text>
                <Text>High (5.0)</Text>
              </View>
              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={1.0}
                maximumValue={5.0}
                step={0.1}
                value={config.recommendation_algorithm.min_rating_threshold}
                onValueChange={(value) => setConfig({
                  ...config,
                  recommendation_algorithm: {
                    ...config.recommendation_algorithm,
                    min_rating_threshold: value
                  }
                })}
                minimumTrackTintColor="#6EA9F7"
                maximumTrackTintColor="#D1D5DB"
                thumbTintColor="#6EA9F7"
              />
            </View>
          </View>
        </View>

        {/* Notification Settings */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Notification Settings</Text>
          
          <View style={styles.switchContainer}>
            <View>
              <Text style={styles.settingLabel}>New User Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive notifications when new users register
              </Text>
            </View>
            <Switch
              value={config.notification_settings.new_users_notification}
              onValueChange={(value) => setConfig({
                ...config,
                notification_settings: {
                  ...config.notification_settings,
                  new_users_notification: value
                }
              })}
              trackColor={{ false: '#E5E7EB', true: '#D1E5FF' }}
              thumbColor={config.notification_settings.new_users_notification ? '#6EA9F7' : '#F3F4F6'}
            />
          </View>
          
          <View style={styles.switchContainer}>
            <View>
              <Text style={styles.settingLabel}>Low Rating Alerts</Text>
              <Text style={styles.settingDescription}>
                Receive alerts when users give low ratings (below 2.0)
              </Text>
            </View>
            <Switch
              value={config.notification_settings.low_rating_alert}
              onValueChange={(value) => setConfig({
                ...config,
                notification_settings: {
                  ...config.notification_settings,
                  low_rating_alert: value
                }
              })}
              trackColor={{ false: '#E5E7EB', true: '#D1E5FF' }}
              thumbColor={config.notification_settings.low_rating_alert ? '#6EA9F7' : '#F3F4F6'}
            />
          </View>
          
          <View style={styles.switchContainer}>
            <View>
              <Text style={styles.settingLabel}>Daily Usage Reports</Text>
              <Text style={styles.settingDescription}>
                Receive daily summary reports of user activity
              </Text>
            </View>
            <Switch
              value={config.notification_settings.daily_report}
              onValueChange={(value) => setConfig({
                ...config,
                notification_settings: {
                  ...config.notification_settings,
                  daily_report: value
                }
              })}
              trackColor={{ false: '#E5E7EB', true: '#D1E5FF' }}
              thumbColor={config.notification_settings.daily_report ? '#6EA9F7' : '#F3F4F6'}
            />
          </View>
        </View>

        {/* Data Retention Settings */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Data Retention</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Log Retention Period (Days)</Text>
            <Text style={styles.settingDescription}>
              Number of days to keep user activity logs before automatically deleting them
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={config.data_retention.log_retention_days.toString()}
                onChangeText={(text) => {
                  const value = parseInt(text) || 0;
                  setConfig({
                    ...config,
                    data_retention: {
                      ...config.data_retention,
                      log_retention_days: value
                    }
                  });
                }}
                keyboardType="numeric"
              />
            </View>
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>User Inactivity Threshold (Days)</Text>
            <Text style={styles.settingDescription}>
              Number of days of inactivity before a user is considered inactive
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={config.data_retention.user_inactivity_threshold_days.toString()}
                onChangeText={(text) => {
                  const value = parseInt(text) || 0;
                  setConfig({
                    ...config,
                    data_retention: {
                      ...config.data_retention,
                      user_inactivity_threshold_days: value
                    }
                  });
                }}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Success Message */}
        {successMessage && (
          <View style={styles.successMessage}>
            <Text style={styles.successText}>{successMessage}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.sectionContainer}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveConfig}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Save Configuration</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetConfig}
            disabled={saving}
          >
            <Text style={styles.resetButtonText}>Reset to Original Values</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SystemSettings;