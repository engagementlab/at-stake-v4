using System;
using System.Diagnostics;
using System.Linq;
using NUnit.Framework;
using NUnit.Framework.Internal;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Remote;
using OpenQA.Selenium.Support.UI;

namespace SeleniumTest
{
  class Program
  {

    private static bool waitTime(DateTime now, TimeSpan then)
    {
      return (DateTime.Now - now) > then;
    }

    private static void Main(string[] args)
    {
      string[] usernames =
      {
        "Bartholomew Shoe", "Weir Doe",
        "Abraham Pigeon", "Gunther Beard",
        "Hermann P. Schnitzel", "Nigel Nigel", "Fig Nelson",
        "Gibson Montgomery-Gibson", "Caspian Bellevedere",
        "Lance Bogrol", "Gustav Purpleson", "Inverness McKenzie", "Dylan Meringue", "Archibald Northbottom",
        "Niles Peppertrout", "Brian Cumin", "Fleece Marigold",
        "Shequondolisa Bivouac", "Indigo Violet",
        "Natalya Undergrowth", "Wisteria Ravenclaw",
        "Rodney Artichoke", "Fletch Skinner", "Piff Jenkins",
        "Carnegie Mondover", "Valentino Morose", "Eric Widget",
        "Giles Posture", "Norman Gordon", "Gordon Norman",
        "Burgundy Flemming", "Girth Wiedenbauer",
        "Lurch Schpellchek", "Parsley Montana",
        "Fergus Douchebag", "Ursula Gurnmeister",
        "Bodrum Salvador", "Pelican Steve",
        "Gideon Guernsey-Marmaduke", "Druid Wensleydale",
        "Linguina Nettlewater", "Chaplain Mondover",
        "Jarvis Pepperspray", "Jonquil Von Haggerston",
        "Brandon Guidelines", "Sue Shei", "Ingredia Nutrisha",
        "Cecil Hipplington-Shoreditch", "Penny Tool",
        "Samuel Serif", "Manuel Internetiquette", "Eleanor Fant", "Nathaneal Down", "Hanson Deck", "Desmond Eagle",
        "Richard Tea", "Quiche Hollandaise", "Hans Down",
        "Will Barrow", "Guy Mann", "Phillip Anthropy",
        "Benjamin Evalent", "Sir Cumference", "Dianne Ameter",
        "Alan Fresco", "Spruce Springclean", "Chauffina Carr",
        "Max Conversion", "Malcolm Function", "Ruby Von Rails",
        "Jason Response", "Jake Weary", "Justin Case",
        "Douglas Lyphe", "Ruüd van Driver", "Theodore Handle",
        "Hilary Ouse", "Dominic L. Ement", "Hugh Saturation",
        "Jackson Pot", "Elon Gated", "Russell Sprout",
        "Jim Séchen", "Hugh Millie-Yate", "Joss Sticks",
        "Thomas R. Toe", "Miles Tone", "Ravi O'Leigh",
        "Barry Tone"
      };

      var options = new ChromeOptions();
      options.AddArgument("--auto-open-devtools-for-tabs");
      options.SetLoggingPreference(LogType.Browser, LogLevel.All);

      var service = ChromeDriverService.CreateDefaultService();
      service.LogPath = "./chromedriver.log";
      service.EnableVerboseLogging = true;
      IWebDriver driver = new ChromeDriver(options);

      // var caps = new DesiredCapabilities();
      // caps.SetCapability("browserName", "iPhone");
      // caps.SetCapability("device", "iPhone 8 Plus");
      // caps.SetCapability("realMobile", "true");
      // caps.SetCapability("os_version", "11");
      // caps.SetCapability("browserstack.user", "engagementlab1");
      // caps.SetCapability("browserstack.key", "JZ41mCB2nuWYzJhui7RN");
      // caps.SetCapability("name", "Bstack-[C_sharp] Sample Test");
      //
      // driver = new RemoteWebDriver(
      //   new Uri("http://hub-cloud.browserstack.com/wd/hub/"), caps
      // );

      driver.Navigate().GoToUrl("http://localhost:3000/");
      
      ((IJavaScriptExecutor) driver).ExecuteScript("localStorage.debug = '*';");

      const int timeoutSeconds = 135;
      var ts = new TimeSpan(0, 0, timeoutSeconds);
      var wait = new WebDriverWait(driver, ts);

      var socketStatus = driver.FindElement(By.Id("state"));
      var txt = socketStatus.Text;
      wait.Until(SeleniumExtras.WaitHelpers.ExpectedConditions.TextToBePresentInElement(socketStatus, "Socket: Connected"));
      
      driver.FindElement(By.Id("btn-new-game")).Click();

      wait.Until((driver) => driver.FindElement(By.Id("btn-deck-0")) != null);

      driver.FindElement(By.Id("btn-deck-0")).Click();

      wait.Until((driver) => driver.FindElement(By.Id("room-code")) != null);
      var roomCode = driver.FindElement(By.Id("room-code")).Text;

      // return;

      // Player 1 tab
      ((IJavaScriptExecutor)driver).ExecuteScript("window.open('http://localhost:3000')");
      driver.SwitchTo().Window(driver.WindowHandles.Last());
      // driver.Navigate().GoToUrl("http://localhost:3000");

      ((IJavaScriptExecutor) driver).ExecuteScript("sessionStorage.clear();");
      ((IJavaScriptExecutor) driver).ExecuteScript("localStorage.debug = '*';");

      IWebElement joinBtn = null;
      IWebElement joinCodeInput = null;

      wait.Until((driver) =>
      {
        joinBtn = driver.FindElement(By.Id("btn-join-game"));

        return joinBtn != null;
      });
      joinBtn.Click();

      wait.Until((driver) =>
      {
        joinCodeInput = driver.FindElement(By.Id("input-room-code"));
        return joinCodeInput != null;
      });

      var usernameInput = driver.FindElement(By.Id("input-name"));

      joinCodeInput.SendKeys(roomCode);
      usernameInput.SendKeys(usernames[new Random().Next(0, usernames.Length)]);

      // Player 1 joins
      driver.FindElement(By.Id("btn-join-submit")).Click();

      // Facilitator tab
      driver.SwitchTo().Window(driver.WindowHandles.First());
      driver.FindElement(By.Id("btn-start-game")).Click();

      // Player 1 tab hits 'continue' -> 'ready'
      driver.SwitchTo().Window(driver.WindowHandles.Last());
      IWebElement btnContinue = null;
      IWebElement btnReady = null;

      // Checking for interstitial being invisible doesn't work, so just wait the time
      var now = DateTime.Now;
      var then = new TimeSpan(0, 0, 0, 2, 100);
      wait.Until(driver => waitTime(now, then));

      driver.FindElement(By.Id("btn-continue")).Click();

      wait.Until((driver) =>
      {
        btnReady = driver.FindElement(By.Id("btn-ready"));
        return btnReady != null;
      });
      btnReady.Click();

      // Fac tab hit continue & start timer
      driver.SwitchTo().Window(driver.WindowHandles.First());

      IWebElement btnTimer = null;
      wait.Until((driver) =>
      {
        btnContinue = driver.FindElement(By.Id("btn-continue"));
        return btnContinue != null;
      });
      btnContinue.Click();

      wait.Until((driver) =>
      {
        btnTimer = driver.FindElement(By.Id("btn-start-timer"));
        return btnTimer.Enabled;
      });
      btnTimer.Click();

      IWebElement btnNextPhase = null;
      wait.Until((driver) =>
      {
        btnNextPhase = driver.FindElement(By.Id("btn-next-phase"));
        return btnNextPhase != null;
      });
      btnNextPhase.Click();
      
      driver.Close();

    }
    
  }
}
