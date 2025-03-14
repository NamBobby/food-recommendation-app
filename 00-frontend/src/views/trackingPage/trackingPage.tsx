import React, { useEffect, useState } from "react";
import { View, Platform, Text } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import UserInfo from "../userPage/userInfo";
import Row from "../../components/rowHome";
import TrackingStyle from "../../styles/trackingStyle";

const Tracking: React.FC = () => {
  const [chartData, setChartData] = useState<{ date: string; result: string }[]>([]);
  const [todayDate, setTodayDate] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    // 🟢 Dữ liệu giả để test UI
    const dummyData = [
      { date: "1 Jan", result: "level_1" },
      { date: "2 Jan", result: "level_2" },
      { date: "3 Jan", result: "level_3" },
      { date: "4 Jan", result: "level_2" },
      { date: "5 Jan", result: "level_1" },
    ];
    setChartData(dummyData);
  }, []);

  useEffect(() => {
    const currentDate = new Date();
    const month = currentDate.toLocaleString("default", { month: "short" });
    const day = currentDate.getDate();
    const formattedDate = `Today, ${day} ${month}`;
    setTodayDate(formattedDate);
  }, []);

  useEffect(() => {
    if (chartData.length > 1) {
      const latestData = chartData[chartData.length - 1];
      const previousData = chartData[chartData.length - 2];

      if (latestData && previousData) {
        const latestLevel = parseInt(latestData.result.replace("level_", ""), 10);
        const previousLevel = parseInt(previousData.result.replace("level_", ""), 10);

        if (latestLevel !== previousLevel) {
          const increased = latestLevel > previousLevel;
          const comparisonText = increased ? "increased" : "decreased";
          setNotification(`🔔 ${todayDate} - Your acne severity ${comparisonText} from level_${previousLevel} to level_${latestLevel}`);
        } else {
          setNotification(null);
        }
      } else {
        setNotification(null);
      }
    } else {
      setNotification(null);
    }
  }, [chartData]);

  const chartConfigure = {
    strokeWidth: 2,
    yLabel: (value: number) => `level_${value}`,
    backgroundColor: "#B7AEDF",
    backgroundGradientFrom: "#DBB1D3",
    backgroundGradientTo: "#DBB1D3",
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  };

  const graphStyle = {
    marginVertical: 10,
    borderRadius: 8,
    backgroundColor: "white",
  };

  return (
    <View style={TrackingStyle.container}>
      <View style={TrackingStyle.info}>
        <Row handleHome={() => {}} /> {/* 🟢 Không điều hướng */}
        <UserInfo userName="Guest" handleSignOut={() => {}} /> {/* 🟢 Không điều hướng */}
      </View>

      <View style={TrackingStyle.topinfo}>
        <Text style={TrackingStyle.title}>Acne Tracker</Text>
        {chartData.length > 0 ? (
          <View style={TrackingStyle.chartContainer}>
            <LineChart
              chartConfig={chartConfigure}
              data={{
                labels: chartData.map((data) => data.date),
                datasets: [
                  {
                    data: chartData.map((data) => {
                      return parseInt(data.result.replace("level_", ""), 10);
                    }),
                  },
                ],
              }}
              style={graphStyle}
              width={Dimensions.get("window").width - (Platform.OS === "ios" ? 40 : 80)}
              height={250}
              yAxisLabel="level_"
              verticalLabelRotation={30}
              segments={3}
              formatYLabel={(value) => Math.floor(parseFloat(value)).toString()}
            />
          </View>
        ) : (
          <Text style={TrackingStyle.title}>Data Tracking is empty</Text>
        )}
      </View>
      {chartData.length > 0 && notification !== null && (
        <View style={TrackingStyle.bottominfo}>
          <View style={TrackingStyle.noti}>
            <Text style={TrackingStyle.notiText}>{notification}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default Tracking;
